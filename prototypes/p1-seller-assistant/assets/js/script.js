/* ── DOM refs ── */
var helpBtn     = document.getElementById('help-btn');
var saPanel     = document.getElementById('sa-panel');
var saClose     = document.getElementById('sa-close');
var saLoading   = document.getElementById('sa-loading');
var saBody      = document.getElementById('sa-body');
var saInput     = document.getElementById('sa-input');
var saSendBtn   = document.getElementById('sa-send');
var saAttach    = document.getElementById('sa-attach-btn');
var saFileInput = document.getElementById('sa-file-input');
var saFileSlot  = document.getElementById('sa-file-slot');
var saStop      = document.getElementById('sa-stop');
var saInputArea = document.getElementById('sa-input-area');
var saSubtitle  = document.getElementById('sa-subtitle');
var saOptions   = document.getElementById('sa-options');
var saNqs       = document.getElementById('sa-nqs');

var loadTimer       = null;
var streamTimers    = [];
var isOpen          = false;
var isGenerating    = false;
var dgRespOptionsEl = null; /* non-null while DG 5-options are active */
var pendingASIN     = '';   /* ASIN entered in the form, used by the result response */

/* ════════════════════════════════
   PANEL OPEN / CLOSE
════════════════════════════════ */
function openPanel() {
  if (isOpen) return;
  isOpen = true;
  saPanel.classList.add('open');
  saPanel.setAttribute('aria-hidden', 'false');
  helpBtn.classList.add('active');
  saLoading.classList.add('visible');
  saBody.classList.remove('visible', 'faded-in');
  loadTimer = setTimeout(function () {
    saLoading.classList.remove('visible');
    saBody.classList.add('visible');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        saBody.classList.add('faded-in');
      });
    });
  }, 1600);
}

function closePanel() {
  isOpen = false;
  clearTimeout(loadTimer);
  cancelStreams();
  saPanel.classList.remove('open');
  saPanel.setAttribute('aria-hidden', 'true');
  helpBtn.classList.remove('active');
  setTimeout(function () {
    saLoading.classList.remove('visible');
    saBody.classList.remove('visible', 'faded-in');
  }, 400);
}

helpBtn.addEventListener('click', openPanel);
saClose.addEventListener('click', closePanel);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && isOpen) closePanel();
});

/* ════════════════════════════════
   SEND BUTTON ENABLE / DISABLE
════════════════════════════════ */
function refreshSendBtn() {
  saSendBtn.disabled = saInput.value.trim().length === 0
    && !saFileSlot.classList.contains('has-file');
}
saInput.addEventListener('input', refreshSendBtn);

saInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey && !saSendBtn.disabled && !isGenerating) {
    e.preventDefault();
    sendMessage();
  }
});

/* ════════════════════════════════
   OPTION BUTTON CLICKS (welcome screen)
════════════════════════════════ */
saOptions.addEventListener('click', function (e) {
  var btn = e.target.closest('.sa-option');
  if (!btn || btn.classList.contains('sa-show-more') || isGenerating) return;
  saInput.value = btn.textContent.trim();
  refreshSendBtn();
  sendMessage();
});

/* ════════════════════════════════
   FILE ATTACHMENT
════════════════════════════════ */
saAttach.addEventListener('click', function () {
  if (isGenerating) return;
  saFileInput.value = '';
  saFileInput.click();
});

saFileInput.addEventListener('change', function () {
  if (saFileInput.files.length > 0) showFileRow(saFileInput.files[0]);
});

function showFileRow(file) {
  var row = document.createElement('div');
  row.className = 'sa-file-row';
  row.innerHTML =
    '<div class="sa-file-row-inner">' +
      '<img class="sa-check-icon" src="assets/images/check-circle.svg" alt="" />' +
      '<span class="sa-file-name" title="' + escHtml(file.name) + '">' + escHtml(file.name) + '</span>' +
      '<button class="sa-file-remove" aria-label="Remove file">' +
        '<svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#5e6a78" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '</button>' +
    '</div>';
  row.querySelector('.sa-file-remove').addEventListener('click', function () {
    saFileSlot.innerHTML = '';
    saFileSlot.classList.remove('has-file');
    refreshSendBtn();
  });
  saFileSlot.innerHTML = '';
  saFileSlot.appendChild(row);
  saFileSlot.classList.add('has-file');
  refreshSendBtn();
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ════════════════════════════════
   TOPIC DETECTION
════════════════════════════════ */
function detectTopic(text) {
  if (dgRespOptionsEl !== null) return 'dg-suggestion';
  var lower = text.toLowerCase();
  if (lower.indexOf('dangerous') !== -1 || lower.indexOf('hazmat') !== -1) {
    return 'dangerous-goods';
  }
  return 'product-update';
}

/* ════════════════════════════════
   STREAM HELPERS
════════════════════════════════ */
function cancelStreams() {
  streamTimers.forEach(clearTimeout);
  streamTimers = [];
  isGenerating = false;
  saInputArea.classList.remove('generating');
  refreshSendBtn();
}

function scrollToBottom() {
  saBody.scrollTop = saBody.scrollHeight;
}

function streamText(el, text, speed, cb) {
  var i = 0;
  speed = speed || 18;
  function tick() {
    if (i >= text.length) { if (cb) cb(); return; }
    var chunk = Math.min(3, text.length - i);
    el.textContent += text.slice(i, i + chunk);
    i += chunk;
    scrollToBottom();
    var t = setTimeout(tick, speed);
    streamTimers.push(t);
  }
  tick();
}

/* Stream an array of {text, bold} segments sequentially */
function streamSegments(container, segments, speed, cb) {
  var idx = 0;
  function next() {
    if (idx >= segments.length) { if (cb) cb(); return; }
    var seg = segments[idx++];
    var el = document.createElement(seg.bold ? 'strong' : 'span');
    container.appendChild(el);
    streamText(el, seg.text, speed, next);
  }
  next();
}

/* ════════════════════════════════
   SEND MESSAGE
════════════════════════════════ */
saSendBtn.addEventListener('click', sendMessage);

function sendMessage() {
  if (isGenerating) return;

  var text = saInput.value.trim();
  var hasFile = saFileSlot.classList.contains('has-file');
  var fileName = '';
  if (hasFile) {
    var nameEl = saFileSlot.querySelector('.sa-file-name');
    if (nameEl) fileName = nameEl.textContent;
  }
  if (!text && !hasFile) return;

  var topic = detectTopic(text);

  if (topic === 'dg-suggestion' && dgRespOptionsEl) {
    dgRespOptionsEl.classList.add('locked');
    dgRespOptionsEl = null;
  }

  saInput.value = '';
  saFileSlot.innerHTML = '';
  saFileSlot.classList.remove('has-file');
  refreshSendBtn();

  saOptions.classList.add('locked');
  saSubtitle.textContent = 'Generating...';

  appendUserMessage(text, hasFile, fileName);

  isGenerating = true;
  saInputArea.classList.add('generating');

  var thinkingTexts = {
    'dangerous-goods': 'I\'ll help you with your dangerous goods issue. Let me search for the most current information about dangerous goods policies and procedures on Amazon.\nBased on the information I found,',
    'dg-suggestion':   'I see you\'ve been waiting about a month. Let me identify the best option to check your application status...',
    'product-update':  'I understand that you\'ve submitted the title change 25 hours ago and it still hasn\'t reflected. Let me search for relevant tools and information to help resolve this...'
  };

  var saRow = appendThinkingRow(topic);
  var thinkingEl = saRow.querySelector('.sa-thinking-stream');
  streamText(thinkingEl, thinkingTexts[topic], 14, function () {
    var t = setTimeout(function () { transitionToResponse(saRow, topic); }, 550);
    streamTimers.push(t);
  });
}

/* ════════════════════════════════
   BUILD USER BUBBLE
════════════════════════════════ */
function appendUserMessage(text, hasFile, fileName) {
  var wrap = document.createElement('div');
  wrap.className = 'sa-user-msg';

  if (hasFile && fileName) {
    var filePill = document.createElement('div');
    filePill.className = 'sa-user-file-pill';
    filePill.innerHTML =
      '<img src="assets/images/check-circle.svg" alt="" />' +
      '<span>' + escHtml(fileName) + '</span>';
    wrap.appendChild(filePill);
  }

  if (text) {
    var bubble = document.createElement('div');
    bubble.className = 'sa-user-bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
  }

  saBody.appendChild(wrap);
  scrollToBottom();
}

/* ════════════════════════════════
   BUILD SA THINKING ROW
════════════════════════════════ */
function appendThinkingRow(topic) {
  var row = document.createElement('div');
  row.className = 'sa-msg-row';

  var streamWrapper = topic === 'dangerous-goods'
    ? '<div class="sa-thinking-quoted"><div class="sa-thinking-stream"></div></div>'
    : '<div class="sa-thinking-stream"></div>';

  row.innerHTML =
    '<div class="sa-avatar-thinking">' +
      '<img class="sa-think-bg" src="assets/images/thinking-bg.svg" alt="" />' +
      '<img class="sa-think-sparkle" src="assets/images/sparkle-alt.svg" alt="" />' +
      '<div class="sa-think-ring"></div>' +
    '</div>' +
    '<div class="sa-content">' +
      '<div class="sa-sender-name">Seller Assistant</div>' +
      streamWrapper +
    '</div>';

  saBody.appendChild(row);
  scrollToBottom();
  return row;
}

/* ════════════════════════════════
   COLLAPSE THINKING → "Here's what I found"
════════════════════════════════ */
function collapseThinking(content) {
  var target = content.querySelector('.sa-thinking-quoted') ||
               content.querySelector('.sa-thinking-stream');
  var foundHeader = document.createElement('div');
  foundHeader.className = 'sa-found-header';
  foundHeader.innerHTML = 'Here\'s what I found<img src="assets/images/chevron-sm.svg" alt="" />';
  target.replaceWith(foundHeader);
}

/* ════════════════════════════════
   THINKING → RESPONSE TRANSITION
════════════════════════════════ */
function transitionToResponse(row, topic) {
  var content        = row.querySelector('.sa-content');
  var avatarThinking = row.querySelector('.sa-avatar-thinking');

  var regularAvatar = document.createElement('div');
  regularAvatar.className = 'sa-avatar';
  regularAvatar.innerHTML = '<img src="assets/images/sparkle.svg" class="sa-sparkle" alt="" />';
  avatarThinking.replaceWith(regularAvatar);

  if (topic === 'dangerous-goods') {
    transitionDangerousGoods(content);
  } else if (topic === 'dg-suggestion') {
    transitionDGSuggestion(content);
  } else if (topic === 'asin-lookup') {
    transitionASINLookup(content);
  } else if (topic === 'asin-result') {
    transitionASINResult(content);
  } else {
    transitionProductUpdate(content);
  }
}

/* ── Product-update response ── */
function transitionProductUpdate(content) {
  collapseThinking(content);

  var responseEl = document.createElement('div');
  responseEl.className = 'sa-response-text';
  content.appendChild(responseEl);

  var responseText =
    'Product title updates on Amazon typically take 15 minutes to 24 hours to appear across the platform. ' +
    'Since it\'s been 25 hours, here are a few things to check:\n\n' +
    '1. Verify the edit was saved\n' +
    'Go to Manage Inventory › Edit and confirm the new title is showing. ' +
    'Sometimes edits don\'t save if the session timed out before submitting.\n\n' +
    '2. Check for flat file or API overrides\n' +
    'If a third-party tool or team member submitted a flat file recently, ' +
    'it may have overwritten your change with an older title.\n\n' +
    '3. Brand owner approval\n' +
    'For brand-registered items, title changes may require brand owner approval before going live. ' +
    'Check your listing for any suppression notices.\n\n' +
    'If the title still hasn\'t updated after 48 hours, I can help you open a case with Seller Support.';

  streamText(responseEl, responseText, 11, finishGeneration);
}

/* ── Dangerous-goods response ── */
function transitionDangerousGoods(content) {
  collapseThinking(content);

  var responseEl = document.createElement('div');
  responseEl.className = 'sa-response-text';
  content.appendChild(responseEl);

  var responseText =
    'Let me understand what you need assistance with the dangerous good issue.\n\n' +
    'Here are the common dangerous goods issues I can help with:';

  streamText(responseEl, responseText, 12, function () {
    var optionsDiv = document.createElement('div');
    optionsDiv.className = 'sa-resp-options';
    [
      'Look up an ASIN',
      'FBA Dangerous Goods program',
      'Increase Dangerous Goods storage limit',
      'Dispute Dangerous Goods classification',
      'Submit SDS/Exemption sheet for ASIN review'
    ].forEach(function (label) {
      var btn = document.createElement('button');
      btn.className = 'sa-option';
      btn.textContent = label;
      optionsDiv.appendChild(btn);
    });
    content.appendChild(optionsDiv);
    appendFeedback(content);

    dgRespOptionsEl = optionsDiv;

    scrollToBottom();
    finishGeneration();
  });
}

/* ── DG suggestion response ── */
function transitionDGSuggestion(content) {
  collapseThinking(content);

  var responseEl = document.createElement('div');
  responseEl.className = 'sa-response-text';
  content.appendChild(responseEl);

  var segments = [
    { text: 'Since you submitted it about a month ago, "', bold: false },
    { text: 'Look up an ASIN',                            bold: true  },
    { text: '" is the right option to select. This will let me check your application status and see what\'s happening with your review.\n\n', bold: false },
    { text: 'Do you want me to proceed with the recommended option "Look up an ASIN"?', bold: true }
  ];

  streamSegments(responseEl, segments, 11, function () {
    var optionsDiv = document.createElement('div');
    optionsDiv.className = 'sa-resp-options';

    ['Yes, look up my ASIN', 'Not sure, show me all options'].forEach(function (label) {
      var btn = document.createElement('button');
      btn.className = 'sa-option';
      btn.textContent = label;

      if (label === 'Yes, look up my ASIN') {
        btn.addEventListener('click', function () {
          if (isGenerating) return;
          optionsDiv.classList.add('locked');
          startASINLookup();
        });
      }

      optionsDiv.appendChild(btn);
    });

    content.appendChild(optionsDiv);
    appendFeedback(content);
    scrollToBottom();
    finishGeneration();
  });
}

/* ── ASIN lookup: triggered by "Yes, look up my ASIN" button ── */
function startASINLookup() {
  saSubtitle.textContent = 'Generating...';
  isGenerating = true;
  saInputArea.classList.add('generating');

  var saRow = appendThinkingRow('asin-lookup');
  var thinkingEl = saRow.querySelector('.sa-thinking-stream');
  streamText(thinkingEl, 'Let me pull up the ASIN lookup for your exemption application...', 14, function () {
    var t = setTimeout(function () { transitionToResponse(saRow, 'asin-lookup'); }, 450);
    streamTimers.push(t);
  });
}

function transitionASINLookup(content) {
  collapseThinking(content);

  var responseEl = document.createElement('div');
  responseEl.className = 'sa-response-text';
  content.appendChild(responseEl);

  var segments = [
    { text: 'To look up your application status, I\'ll need the ASIN you submitted for review.', bold: true  },
    { text: '\n\nYou can find your ASIN in ',                                                    bold: false },
    { text: 'Manage Inventory',                                                                  bold: true  },
    { text: ' or on your product listing page.\n\n',                                             bold: false },
    { text: 'What\'s the ASIN for your exemption application?',                                  bold: true  }
  ];

  streamSegments(responseEl, segments, 11, function () {
    var form = document.createElement('div');
    form.className = 'sa-asin-form';
    form.innerHTML =
      '<div class="sa-asin-input-group">' +
        '<label class="sa-asin-label">Enter ASIN</label>' +
        '<input class="sa-asin-input" type="text" placeholder="B001234567" />' +
      '</div>' +
      '<button class="sa-asin-submit">Submit</button>';

    /* Wire up Submit */
    form.querySelector('.sa-asin-submit').addEventListener('click', function () {
      if (isGenerating) return;
      var asinVal = form.querySelector('.sa-asin-input').value.trim() || 'B001234567';
      form.querySelector('.sa-asin-input').value = asinVal; /* ensure value shown in disabled state */
      form.classList.add('submitted');
      startASINResult(asinVal);
    });

    content.appendChild(form);
    appendFeedback(content);
    scrollToBottom();
    finishGeneration();
  });
}

/* ── ASIN result: triggered by Submit in the ASIN form ── */
function startASINResult(asin) {
  pendingASIN = asin;
  saSubtitle.textContent = 'Generating...';
  isGenerating = true;
  saInputArea.classList.add('generating');

  var saRow = appendThinkingRow('asin-result');
  var thinkingEl = saRow.querySelector('.sa-thinking-stream');
  streamText(thinkingEl, 'Checking exemption status for ' + asin + ' with Amazon\'s systems...', 14, function () {
    var t = setTimeout(function () { transitionToResponse(saRow, 'asin-result'); }, 500);
    streamTimers.push(t);
  });
}

function transitionASINResult(content) {
  var asin = pendingASIN || 'B001234567';
  pendingASIN = '';

  collapseThinking(content);

  var responseEl = document.createElement('div');
  responseEl.className = 'sa-response-text';
  content.appendChild(responseEl);

  var segments = [
    { text: 'Great news! I checked ',                                                                                   bold: false },
    { text: asin,                                                                                                        bold: true  },
    { text: ' and your dangerous goods exemption application has been approved.\n\n',                                   bold: false },
    { text: 'Here\'s what this means:\n\n',                                                                              bold: true  },
    { text: '•  Your product is now cleared to sell as FBA inventory\n\n' +
            '•  You can start shipping units to Amazon fulfillment centers\n\n' +
            '•  The dangerous goods classification has been updated in your listing\n\n', bold: false },
    { text: 'Ready to start shipping, or do you have questions about next steps?',               bold: true  }
  ];

  streamSegments(responseEl, segments, 11, function () {
    appendFeedback(content);
    scrollToBottom();
    showContactChip();
    finishGeneration();
  });
}

/* ════════════════════════════════
   CONTACT ASSOCIATES CHIP
════════════════════════════════ */
function showContactChip() {
  saNqs.innerHTML = '';
  var chip = document.createElement('button');
  chip.className = 'sa-nqs-chip';
  chip.textContent = 'Contact associates';
  saNqs.appendChild(chip);
  saNqs.classList.add('visible');
}

/* ════════════════════════════════
   SHARED HELPERS
════════════════════════════════ */
function appendFeedback(content) {
  var div = document.createElement('div');
  div.className = 'sa-feedback';
  div.innerHTML =
    '<div class="sa-thumbs">' +
      '<button class="sa-thumb-btn"><img src="assets/images/thumb-up.svg" alt="Helpful" /></button>' +
      '<button class="sa-thumb-btn"><img src="assets/images/thumb-down.svg" alt="Not helpful" /></button>' +
    '</div>' +
    '<span class="sa-feedback-label">Help improve this experience</span>';
  content.appendChild(div);
}

function finishGeneration() {
  isGenerating = false;
  saInputArea.classList.remove('generating');
  saSubtitle.textContent = 'Powered by Amazon';
  streamTimers = [];
  refreshSendBtn();
}

/* ════════════════════════════════
   STOP BUTTON
════════════════════════════════ */
saStop.addEventListener('click', function () {
  cancelStreams();
  saSubtitle.textContent = 'Powered by Amazon';
});
