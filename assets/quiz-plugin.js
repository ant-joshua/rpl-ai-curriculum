/* RPL Quiz Plugin — Docsify interactive quiz */
(function() {
  function initQuiz() {
    var quizDivs = document.querySelectorAll('.quiz');
    if (!quizDivs.length) return;

    quizDivs.forEach(function(container, quizIdx) {
      var questions = container.querySelectorAll('p');
      var currentQuestion = null;
      var questionIndex = 0;
      var lis = container.querySelectorAll('li');
      var questionGroups = [];

      /* group li by preceding p */
      lis.forEach(function(li) {
        var prev = li.previousElementSibling;
        while (prev && prev.tagName !== 'P' && prev.tagName !== 'LI') {
          prev = prev.previousElementSibling;
        }
        if (!prev || prev.tagName === 'P') {
          /* start new question */
          questionIndex++;
          currentQuestion = { index: questionIndex, options: [] };
          questionGroups.push(currentQuestion);
        } else {
          currentQuestion = currentQuestion || { index: ++questionIndex, options: [] };
          if (!questionGroups.includes(currentQuestion)) questionGroups.push(currentQuestion);
        }
        var isCorrect = li.querySelector('input[checked]') !== null;
        var text = li.textContent.replace(/^[\s\[\]\dx\(\)]+/, '').trim();
        currentQuestion.options.push({ text: text, correct: isCorrect, el: li });
      });

      /* if no p found, treat entire quiz as one question */
      if (!questionGroups.length && lis.length) {
        currentQuestion = { index: 1, options: [] };
        lis.forEach(function(li) {
          var isCorrect = li.querySelector('input[checked]') !== null;
          var text = li.textContent.replace(/^[\s\[\]\dx\(\)]+/, '').trim();
          currentQuestion.options.push({ text: text, correct: isCorrect, el: li });
        });
        questionGroups.push(currentQuestion);
      }

      /* get question text from preceding p or from first option context */
      var allPs = container.querySelectorAll('p');
      var pArray = Array.from(allPs);
      questionGroups.forEach(function(qg) {
        var firstLi = qg.options[0] && qg.options[0].el;
        if (firstLi) {
          var prevEl = firstLi.previousElementSibling;
          while (prevEl && prevEl.tagName !== 'P') {
            prevEl = prevEl.previousElementSibling;
          }
          if (prevEl && prevEl.tagName === 'P' && pArray.includes(prevEl)) {
            qg.questionText = prevEl.innerHTML;
            prevEl.style.display = 'none';
          }
        }
      });

      /* rebuild */
      container.innerHTML = '<div class="quiz-score">Skor: <span class="quiz-correct">0</span> / <span class="quiz-total">' + questionGroups.length + '</span></div>';

      questionGroups.forEach(function(qg) {
        var qDiv = document.createElement('div');
        qDiv.className = 'quiz-question';

        var qTitle = document.createElement('p');
        qTitle.className = 'quiz-q-text';
        qTitle.innerHTML = '<strong>' + qg.index + '. ' + (qg.questionText || 'Pilih jawaban yang benar:') + '</strong>';
        qDiv.appendChild(qTitle);

        qg.options.forEach(function(opt) {
          var label = document.createElement('label');
          label.className = 'quiz-option';
          var radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = 'quiz-' + quizIdx + '-q' + qg.index;
          radio.dataset.correct = opt.correct ? 'true' : 'false';

          radio.addEventListener('change', function() {
            if (this.dataset.answered) return;
            this.dataset.answered = 'true';
            var parent = this.closest('.quiz-question');
            var opts = parent.querySelectorAll('.quiz-option');
            opts.forEach(function(o) { o.style.pointerEvents = 'none'; });

            if (this.dataset.correct === 'true') {
              label.classList.add('correct');
            } else {
              label.classList.add('incorrect');
              opts.forEach(function(o) {
                if (o.querySelector('input').dataset.correct === 'true') {
                  o.classList.add('correct');
                }
              });
            }
            updateScore(container);
          });

          label.appendChild(radio);
          label.appendChild(document.createTextNode(' ' + opt.text));
          qDiv.appendChild(label);
        });

        container.appendChild(qDiv);
      });
    });
  }

  function updateScore(container) {
    var correct = container.querySelectorAll('.quiz-option.correct input[data-answered="true"]').length;
    var total = container.querySelectorAll('.quiz-question').length;
    var scoreEl = container.querySelector('.quiz-score .quiz-correct');
    if (scoreEl) scoreEl.textContent = correct;
  }

  function style() {
    var css = document.createElement('style');
    css.textContent = `
.quiz { background: var(--bg-card,#1e293b); border: 1px solid var(--border,#334155); border-radius: 12px; padding: 20px 24px; margin: 16px 0; }
.quiz-score { font-size: 0.9em; color: var(--text-muted,#94a3b8); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border,#334155); }
.quiz-question { margin-bottom: 20px; }
.quiz-q-text { font-size: 1em; margin-bottom: 8px; color: var(--text-primary,#f1f5f9); }
.quiz-option { display: block; padding: 10px 14px; margin: 4px 0; border-radius: 8px; border: 1px solid var(--border,#334155); cursor: pointer; transition: all 0.15s; background: var(--bg-secondary,#0f172a); color: var(--text-primary,#f1f5f9); }
.quiz-option:hover { border-color: var(--accent,#FF6B35); }
.quiz-option input { margin-right: 8px; accent-color: var(--accent,#FF6B35); }
.quiz-option.correct { background: rgba(34,197,94,0.15); border-color: #22c55e; }
.quiz-option.incorrect { background: rgba(239,68,68,0.15); border-color: #ef4444; }
.quiz-option.correct::after { content: " ✓"; color: #22c55e; font-weight: bold; }
.quiz-option.incorrect::after { content: " ✗"; color: #ef4444; font-weight: bold; }
/* light mode overrides */
html[data-theme="light"] .quiz { background: #fff; border-color: #e2e8f0; }
html[data-theme="light"] .quiz-option { background: #f8fafc; border-color: #e2e8f0; color: #1e293b; }
html[data-theme="light"] .quiz-q-text { color: #1e293b; }
`;
    document.head.appendChild(css);
  }

  /* Hook into Docsify */
  var oldDoneEach = window.Docsify && window.Docsify.doneEach;
  if (window.$docsify) {
    var orig = window.$docsify.plugin || [];
    window.$docsify.plugin = orig.concat(function(hook) {
      hook.doneEach(function() {
        setTimeout(initQuiz, 100);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', style);
  } else { style(); }

})();
