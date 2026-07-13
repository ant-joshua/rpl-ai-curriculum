import { browser } from '$app/environment';

export interface Step {
  id: number;
  title: string;
  instruction: string;
  starterCode: string;
  expectedElements: string[];
  hint: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  techs: string[];
  difficulty: string;
  timeEstimate: string;
  steps: Step[];
}

export interface ProjectProgress {
  currentStep: number;
  completedSteps: number[];
  codeState: Record<number, string>;
  completed: boolean;
}

function createProjectsStore() {
  let projects = $state<Project[]>([]);
  let currentProject = $state<Project | null>(null);
  let progress = $state<ProjectProgress>({
    currentStep: 0,
    completedSteps: [],
    codeState: {},
    completed: false,
  });

  async function loadProjects(): Promise<void> {
    try {
      const res = await fetch('/content/projects.json');
      const data = await res.json();
      projects = (data as (Project | { slug: string })[]).filter(
        (p: any) => !p.slug.startsWith('_')
      ) as Project[];
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
  }

  function loadProject(slug: string): Project | null {
    const found = projects.find((p) => p.slug === slug) || null;
    if (found) {
      currentProject = found;
    }
    return found;
  }

  async function loadProgress(projectSlug: string): Promise<void> {
    if (!browser) return;
    try {
      const deviceId = localStorage.getItem('device_id') || 'anonymous';
      const res = await fetch(`/api/project/${projectSlug}/progress`, {
        headers: { 'x-device-id': deviceId },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          progress = {
            currentStep: json.data.current_step || 0,
            completedSteps: JSON.parse(json.data.completed_steps || '[]'),
            codeState: json.data.code_state ? JSON.parse(json.data.code_state) : {},
            completed: !!json.data.completed_at,
          };
        }
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
  }

  function saveCode(stepId: number, code: string): void {
    progress.codeState = { ...progress.codeState, [stepId]: code };
  }

  async function completeStep(projectSlug: string, stepId: number): Promise<boolean> {
    if (!browser) return false;
    try {
      const deviceId = localStorage.getItem('device_id') || 'anonymous';
      const res = await fetch(`/api/project/${projectSlug}/step/${stepId}/complete`, {
        method: 'POST',
        headers: { 'x-device-id': deviceId },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (!progress.completedSteps.includes(stepId)) {
            progress.completedSteps = [...progress.completedSteps, stepId];
          }
          if (json.data?.next_step !== undefined) {
            progress.currentStep = json.data.next_step;
          } else {
            progress.currentStep = stepId;
          }
          if (json.data?.completed) {
            progress.completed = true;
          }
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Failed to complete step:', e);
      return false;
    }
  }

  async function completeProject(slug: string, title: string): Promise<boolean> {
    if (!browser) return false;
    try {
      const deviceId = localStorage.getItem('device_id') || 'anonymous';
      const res = await fetch(`/api/project/${slug}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
        },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          progress.completed = true;
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Failed to complete project:', e);
      return false;
    }
  }

  function getNextProject(currentSlug: string): Project | null {
    const currentIdx = projects.findIndex((p) => p.slug === currentSlug);
    if (currentIdx >= 0 && currentIdx < projects.length - 1) {
      return projects[currentIdx + 1];
    }
    // Recommend first incomplete project by difficulty progression
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const current = projects.find((p) => p.slug === currentSlug);
    if (current) {
      const curDiffIdx = difficulties.indexOf(current.difficulty);
      for (let d = curDiffIdx; d < difficulties.length; d++) {
        const next = projects.find(
          (p) => p.difficulty === difficulties[d] && p.slug !== currentSlug
        );
        if (next) return next;
      }
    }
    return projects.length > 0 ? projects[0] : null;
  }

  // Lazy load on init
  if (browser) {
    loadProjects();
  }

  return {
    get projects() {
      return projects;
    },
    get currentProject() {
      return currentProject;
    },
    get progress() {
      return progress;
    },
    loadProjects,
    loadProject,
    loadProgress,
    saveCode,
    completeStep,
    completeProject,
    getNextProject,
  };
}

export const projectsStore = createProjectsStore();
