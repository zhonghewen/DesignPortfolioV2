/* ── frame navigation ── */
function goto(frameId) {
  document.querySelectorAll('.frame').forEach(f => f.classList.remove('active'));
  var next = document.getElementById(frameId);
  if (!next) return;
  next.classList.add('active');

  var label = document.getElementById('state-label');
  if (label) label.textContent = next.dataset.label || frameId;
}

/* ── keyboard shortcuts ── */
/* Optional: arrow keys to step through frames in order */
var frameOrder = Array.from(document.querySelectorAll('.frame')).map(f => f.id);
document.addEventListener('keydown', function(e) {
  var active = document.querySelector('.frame.active');
  if (!active) return;
  var idx = frameOrder.indexOf(active.id);
  if (e.key === 'ArrowRight' && idx < frameOrder.length - 1) goto(frameOrder[idx + 1]);
  if (e.key === 'ArrowLeft'  && idx > 0)                     goto(frameOrder[idx - 1]);
});
