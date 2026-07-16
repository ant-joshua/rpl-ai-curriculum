import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * GET /api/my/course/[offeringId]/modules
 * Returns all content_blocks for an offering as a module/lesson tree
 * with completion status per lesson.
 */
export async function GET({ params, request, platform }: {
  params: { offeringId: string };
  request: Request;
  platform: App.Platform;
}): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    const userId = session.user.id;
    const db = getDB(platform);
    const offeringId = params.offeringId;

    // Fetch content_blocks tree for this offering
    const { results: treeBlocks } = await db.prepare(
      `SELECT id, type, title, subtitle, slug, parent_id, order_index,
              duration_min, is_optional, unlock_days, visibility, weight, due_date,
              source_id
       FROM content_blocks
       WHERE course_offering_id = ?
       ORDER BY order_index ASC`
    ).bind(offeringId).all<any>();

    // Build tree from flat list
    function buildTree(blocks: any[], parentId: string | null = null): any[] {
      return blocks
        .filter((b: any) => b.parent_id === parentId)
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((b: any) => ({
          ...b,
          children: buildTree(blocks, b.id),
        }));
    }

    const tree = buildTree(treeBlocks || []);

    // Fetch completed lessons
    const { results: completed } = await db.prepare(
      `SELECT session_id, completed
       FROM progress
       WHERE user_id = ? AND module_slug = ? AND completed = 1`
    ).bind(userId, offeringId).all<{ session_id: string; completed: number }>();

    const completedSlugs = new Set((completed || []).map((c: any) => c.session_id));

    // Annotate tree with completion
    function annotateTree(nodes: any[]): any[] {
      return nodes.map((n: any) => {
        const isLesson = n.type === 'lesson';
        const isCompleted = isLesson ? completedSlugs.has(n.slug) : false;
        return {
          ...n,
          isCompleted,
          children: annotateTree(n.children || []),
        };
      });
    }

    const annotatedTree = annotateTree(tree);

    // Flatten to count
    function flattenLessons(nodes: any[]): any[] {
      let result: any[] = [];
      for (const n of nodes) {
        if (n.type === 'lesson') result.push(n);
        result = result.concat(flattenLessons(n.children || []));
      }
      return result;
    }

    const lessons = flattenLessons(annotatedTree);
    const completedCount = lessons.filter((l: any) => l.isCompleted).length;
    const totalCount = lessons.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Assessments & assignments for this offering
    const { results: assessments } = await db.prepare(
      `SELECT id, title, type, max_score, due_date, status
       FROM assessments
       WHERE course_offering_id = ? AND status = 'published'
       ORDER BY due_date ASC`
    ).bind(offeringId).all<any>();

    const { results: assignments } = await db.prepare(
      `SELECT id, title, submission_type, max_score, due_date, status
       FROM assignments
       WHERE course_offering_id = ? AND status = 'published'
       ORDER BY due_date ASC`
    ).bind(offeringId).all<any>();

    return jsonResponse({
      success: true,
      data: {
        tree: annotatedTree,
        progress: {
          completed: completedCount,
          total: totalCount,
          percentage: progress,
        },
        assessments: assessments || [],
        assignments: assignments || [],
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}
