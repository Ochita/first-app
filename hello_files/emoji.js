if (!window.Emoji) {
var Emoji = {

opts: {},
last: 0,
shownId: false,

init: function(txt, opts) {
  var optId = Emoji.last;
  opts.txt = txt;
  if (opts.forceTxt) {
    opts.editable = 0;
    placeholderSetup(txt);
  } else {
    opts.editable = 1;
    setTimeout(function() {
      placeholderSetup(txt, {editable: 1, editableFocus: Emoji.editableFocus});
      if (opts.shouldFocus) {
        Emoji.editableFocus(txt, false, true);
      }
    }, 0);
    if (browser.mozilla) {
      document.execCommand("enableObjectResizing", false, false);
      cur.destroy.push(function() {
        document.execCommand("enableObjectResizing", false, true);
      })
    }
    addEvent(txt, browser.opera ? 'click' : 'mousedown', function(e) {
      if (e.target && e.target.tagName == 'IMG') {
        if (Emoji.getCode(e.target)) {
          Emoji.editableFocus(txt, e.target, e.offsetX > 8);
          return cancelEvent(e);
        }
      }
      opts.emojiFocused = false;
    });

    addEvent(txt, 'keypress keydown keyup paste', function(e) {
      if (e.type == 'keydown') {
        if (e.keyCode == KEY.RETURN || e.keyCode == 10) {
          if ((cur.ctrl_submit || opts.noEnterSend) && (e.ctrlKey || browser.mac && e.metaKey) ||
              !(cur.ctrl_submit || opts.noEnterSend) && !e.shiftKey && !(e.ctrlKey || browser.mac && e.metaKey)) {
            if (!Emoji.emojiEnter(optId, e)) {
              return false;
            }
            //if (!opts.noEnterSend) {
              opts.onSend();
              return cancelEvent(e);
            //}
          }
        }
        if (e.ctrlKey && e.keyCode == KEY.RETURN) {
          var val = this.value;
          if (opts.editable) {
            Emoji.insertHTML('<div><br/></div>');
          } else {
            if (typeof this.selectionStart == "number" && typeof this.selectionEnd == "number") {
              var start = this.selectionStart;
              this.value = val.slice(0, start) + "\n" + val.slice(this.selectionEnd);
              this.selectionStart = this.selectionEnd = start + 1;
            } else if (document.selection && document.selection.createRange) {
              this.focus();
              var range = document.selection.createRange();
              range.text = "\r\n";
              range.collapse(false);
              if (browser.opera) {
                range.moveEnd('character', 0);
                range.moveStart('character', 0);
              }
              range.select();
            }
            txt.autosize.update();
            setTimeout(function () {
              txt.autosize.update();
            }, 0);
          }
          return false;
        }
        if (e.keyCode == KEY.TAB && !(e.ctrlKey || browser.mac && e.metaKey)) {
          if (Emoji.shown) {
            Emoji.editableFocus(txt, false, true);
            Emoji.ttClick(optId, geByClass1('emoji_smile', opts.controlsCont), true);
          } else {
            Emoji.ttClick(optId, geByClass1('emoji_smile', opts.controlsCont), false, true);
          }
          return cancelEvent(e);
        }
        if (e.keyCode == KEY.ESC) {
          if (Emoji.shown) {
            Emoji.editableFocus(txt, false, true);
            Emoji.ttClick(optId, geByClass1('emoji_smile', opts.controlsCont), true);
            return cancelEvent(e);
          }
        }
      }

      if (e.type == 'paste') {
        Emoji.onEditablePaste(txt, opts, optId);
      } else if (cur.editable && e.type == 'keyup') {
        if (opts.checkEditable) {
          opts.checkEditable(optId, txt);
        }
      }
      if (opts.onKeyAction) {
        opts.onKeyAction(e);
      }
      return true;
    });
  }


  Emoji.opts[Emoji.last] = opts;
  return Emoji.last++;
},

onEditablePaste: function(txt, opts, optId) {
  var range = (browser.chrome || browser.safari || (browser.msie && browser.version > 10)) ? Emoji.getRange() : false;
  if (range) {
    var textarea = ce('TEXTAREA', {className: 'emoji_tmp_textarea'});
    txt.parentNode.appendChild(textarea);
    textarea.focus();
  }
  setTimeout(function(){
    if (range) {
      Emoji.setRange(range);
      var text = val(textarea);
      re(textarea);
      if (text) {
        Emoji.insertHTML(clean(text).replace(/\n/g, '<br/>'));
      }
    }
    Emoji.cleanCont(txt);
  }, 0);
},

cleanCont: function(cont) {
  var el = cont.firstChild;
  while (el) {
    var next = el.nextSibling;
    switch (el.nodeType) {
      case 1:
        if (el.id == 'tmp_paste_cont') break;
        if (el.tagName == 'DIV' || el.tagName == 'P' || el.tagName == 'SPAN') {
          el.setAttribute('style', '');
          el.className = '';
          el.id = '';
          Emoji.cleanCont(el);
        } else if (el.tagName == 'IMG') {
          if (!Emoji.getCode(el)) {
            re(el);
          }
        } else if (el.tagName != 'BR' ){
          var text = Emoji.editableVal(el, {saveEmoji: true});
          var f = cf(clean(text).replace(/\n/g, '<br/>'));
          var last = f.lastChild;
          el.parentNode.replaceChild(f, el);
          //if (last) {
          //  Emoji.editableFocus(cont, last, true);
          //}
        }
        break;
    }
    el = next;
  }
},

editableFocus: function(editable, obj, after) {
  if (!editable) {
    return false;
  }
  editable.focus();
  if (editable.phonfocus) {
    editable.phonfocus();
  }
  if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
    var sel = window.getSelection();
    if (browser.opera && !after) {
      sel.collapse(obj || editable, 0);
    } else {
      var range = document.createRange();
      if (obj) {
        range.selectNode(obj);
      } else {
        range.selectNodeContents(editable);
      }
      range.collapse(after ? false : true);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  } else if (typeof document.body.createTextRange != 'undefined') {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(obj || editable);
    textRange.collapse(after ? false : true);
    textRange.select();
  }
},

getRange: function() {
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      return sel.getRangeAt(0);
    }
  } else if (document.selection && document.selection.createRange) {
    return document.selection.createRange();
  }
  return null;
},

setRange: function(range) {
  if (window.getSelection) {
    sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (document.selection && range.select) {
    range.select();
  }
},

editableVal: function(cont, opts) {
  if (!cont) return '';
  if (cont.tagName == 'TEXTAREA') return val(cont);
  var el = cont.firstChild;
  var v = '';
  var contTag = new RegExp('^(DIV|P|LI|OL|TR|TD|BLOCKQUOTE)$');
  while (el) {
    switch (el.nodeType) {
      case 3:
        var str = el.data.replace(/^\n|\n$/g, ' ').replace(/[\n\xa0]/g, ' ').replace(/[ ]+/g, ' ');
        v += str;
        break;
      case 1:
        var str = Emoji.editableVal(el);
        if (el.tagName && el.tagName.match(contTag) && str) {
          if (str.substr(-1) != '\n') {
            str += '\n';
          }

          var prev = el.previousSibling;
          while(prev && prev.nodeType == 3 && trim(prev.nodeValue) == '') {
            prev = prev.previousSibling;
          }
          if (prev && !(prev.tagName && prev.tagName.match(contTag))) {
            str = '\n' + str;
          }

        } else if (el.tagName == 'IMG') {
          var code = Emoji.getCode(el);
          if (code) {
            if (opts && opts.saveEmoji) {
              str += Emoji.getEmojiHTML(code);
            } else {
              str += Emoji.codeToChr(code);
            }
          }
        } else if (el.tagName == 'BR') {
          str += '\n';
        }
        v += str;
        break;
    }
    el = el.nextSibling;
  }
  return v;
},

cssEmoji: {
  'D83DDE0A': [0, ':-)'], 'D83DDE03': [1, ':-D'], 'D83DDE09': [2, ';-)'], 'D83DDE06': [3, 'xD'], 'D83DDE1C': [4, ';-P'], 'D83DDE0B': [5, ':-p'], 'D83DDE0D': [6, '8-)'], 'D83DDE0E': [7, 'B-)'], 'D83DDE12': [8, ':-('], 'D83DDE0F': [9, ':]'], 'D83DDE14': [10, '3('], 'D83DDE22': [11, ':\'('], 'D83DDE2D': [12, ':_('], 'D83DDE29': [13, ':(('], 'D83DDE28': [14, ':o'], 'D83DDE10': [15, ':|'], 'D83DDE0C': [16, '3-)'], 'D83DDE20': [17, '>('], 'D83DDE21': [18, '>(('], 'D83DDE07': [19, 'O:)'], 'D83DDE30': [20, ';o'], 'D83DDE33': [21, '8|'], 'D83DDE32': [22, '8o'], 'D83DDE37': [23, ':X'], 'D83DDE1A': [24, ':-*'], 'D83DDE08': [25, '}:)'], '2764': [26 , '<3'], 'D83DDC4D': [27, ':like:'], 'D83DDC4E': [28, ':dislike:'], '261D': [29, ':up:'], '270C': [30, ':v:'], 'D83DDC4C': [31, ':ok:']
},
imgEmoji: {'D83DDE15': 1, 'D83DDE1F': 1, 'D83DDE2E': 1, 'D83DDE34': 1},

getEmojiHTML: function(code, symbol, enabled) {
  var editable = (browser.msie && intval(browser.version) > 8) ? ' contenteditable="false"' : '';
  if (Emoji.cssEmoji[code] != undefined) {
    var num = -Emoji.cssEmoji[code][0] * 17;
    return '<img'+editable+' src="/images/blank.gif" emoji="'+code+'" '+(symbol ? 'alt="'+symbol+'"' : symbol)+' class="emoji_css" style="background-position: 0px '+num+'px;" />';
  } else {
    if (!Emoji.imgEmoji[code] && symbol && !enabled) {
      return symbol;
    } else {
      return '<img class="emoji" '+(symbol ? 'alt="'+symbol+'"' : symbol)+' src="/images/emoji'+(window.devicePixelRatio >= 2 ? '_2x' : '')+'/'+code+'.png" />';
    }
  }
},

codeToChr: function(code) {
  var len = code.length / 4;
  var chr = '';
  var i = 0;
  while(len--) {
    chr += String.fromCharCode(parseInt(code.substr(i, 4), 16))
    i += 4;
  }
  return chr;
},

checkEditable: function(optId, obj, options) {
  var scH = obj.scrollHeight;
  var opts = Emoji.opts[optId];
  if (!opts) {
    return false;
  }
  var bl = opts.tt;
  if (scH > options.height + 10) {
    if (!opts.isSized) {
      setStyle(obj, {height: options.height+'px', overflowY: 'auto'});
      var sm = geByClass1('emoji_smile', opts.controlsCont);
      var ph = ge('im_upload');
      var diff = sbWidth();
      setStyle(sm, vk.rtl ? {left: 1 + diff} : {right: 1 + diff});
      if (ph) {
        setStyle(ph.parentNode, vk.rtl ? {left: 1 + diff} : {right: 1 + diff});
      }
      if (bl) setStyle(bl, vk.rtl ? {left: (opts.ttDiff || 31) + diff} : {right: (opts.ttDiff || 31) + diff})
      opts.isSized = true;
    }
  } else if (opts.isSized) {
    setStyle(obj, {height: 'auto', overflowY: 'hidden'});
    var sm = geByClass1('emoji_smile', opts.controlsCont);
    var ph = ge('im_upload');
    setStyle(sm, vk.rtl ? {left: 1} : {right: 1});
    if (ph) {
      setStyle(ph.parentNode, vk.rtl ? {left: 1}: {right: 1});
    }
    if (bl) setStyle(bl, vk.rtl ? {left: (opts.ttDiff || 31)} : {right: (opts.ttDiff || 31)})
    opts.isSized = false;
  }
},

emojiEnter: function(optId, e) {
  var opts = Emoji.opts[optId]
  if (opts.emojiFocused && opts.emojiOvered) {
    var img = geByTag1('img', opts.emojiOvered);
    Emoji.addEmoji(optId, Emoji.getCode(img), opts.emojiOvered);
    opts.emojiFocused = true;
    Emoji.ttClick(optId, ge((cur.peer == -3) ? 'imw_smile' : 'im_smile'), true);
    debugLog('canceling');
    return cancelEvent(e);
  }
  return true;
},

insertHTML: function(html) {
  if (browser.msie/* && browser.version < 10*/) {
    if (document.selection) {
      var r = document.selection.createRange();
      if (r.pasteHTML) {
        r.pasteHTML(html);
      }
    } else {
      var r = document.getSelection().getRangeAt(0);
      var n = document.createElement("span");
      r.surroundContents(n);
      n.innerHTML = html;
      r.collapse(false);
    }
  } else {
    document.execCommand('insertHTML', false, html);
  }
},

addEmoji: function(optId, code, obj) {
  if (optId === false) {
    return false;
  }
  var opts = Emoji.opts[optId];
  opts.emojiFocused = false;
  if (opts.editable) {
    var img = ' '+Emoji.getEmojiHTML(code)+'&nbsp;';
    var editable = opts.txt;
    var sel = window.getSelection ? window.getSelection() : false;
    if (sel && sel.rangeCount) {
      r = sel.getRangeAt(0);
      if (r.commonAncestorContainer) {
        var rCont = r.commonAncestorContainer;
      } else {
        var rCont = r.parentElement ? r.parentElement() : r.item(0);
      }
    } else {
      var rCont = false;
    }
    el = rCont;
    while(el && el != editable) {
      el = el.parentNode;
    }
    var edLast = (editable.lastChild || {});
    if (browser.mozilla && edLast.tagName == 'BR' && !edLast.previousSibling) {
      re(editable.lastChild);
    }
    if (!el) {
      Emoji.editableFocus(editable, false, true);
    }
    Emoji.insertHTML(img);
    var emojies = geByClass('emoji', editable);
    emojies.push.apply(emojies, geByClass('emoji_css', editable));
    for (i in emojies) {
      var prev = emojies[i].previousSibling;
      if (prev && prev.nodeType == 3 && prev.textContent && prev.textContent.charCodeAt(0) == 32) {
        var p = prev.previousSibling;
        if (p && p.nodeType == 3 && p.textContent && p.textContent.charCodeAt(p.textContent.length - 1) == 160) {
          re(prev);
        }
      }
    }
    if (editable.check) editable.check();
  } else {
    var textArea = opts.txt;
    var val = textArea.value;
    if (browser.iphone || browser.ipad) {
      var text = Emoji.codeToChr(code);
    } else {
      var text = Emoji.cssEmoji[code][1]+' ';
    }
    var endIndex, range;
    if (textArea.selectionStart != undefined && textArea.selectionEnd != undefined) {
      endIndex = textArea.selectionEnd;
      textArea.value = val.slice(0, textArea.selectionStart) + text + val.slice(endIndex);
      textArea.selectionStart = textArea.selectionEnd = endIndex + text.length;
    } else if (typeof document.selection != 'undefined' && typeof document.selection.createRange != 'undefined') {
      textArea.focus();
      range = document.selection.createRange();
      range.text = text;
      range.select();
    }
  }
  if (opts.saveDraft) {
    opts.saveDraft();
  }
},

ttHide: function(optId) {
  Emoji.ttClick(optId, geByClass1('emoji_smile', Emoji.opts[optId].controlsCont), true);
},

showShadow: function() {
  return !(browser.msie && browser.version < 10);
},

ttClick: function(optId, obj, needHide, needShow, ev) {
  var opts = Emoji.opts[optId];
  if (!opts) {
    return;
  }
  if ((needHide && !Emoji.shown) || (needShow && Emoji.shown)) {
    return;
  }
  if (!obj) {
    obj = Emoji.shown || ge((cur.peer == -3) ? 'imw_smile' : 'im_smile');
  }
  if (obj.tt && obj.tt.destroy) {
    obj.tt.destroy();
  }
  if (!opts.tt && opts.sharedTT && opts.sharedTT.emojiTT) {
    opts.tt = opts.sharedTT.emojiTT;
    opts.emojiScroll = opts.sharedTT.emojiScroll;
    opts.allEmojiId = opts.sharedTT.emojiAllId;
  }
  var tt = opts.tt;
  if (!tt) {
    var pointerStyle = '';
    if (opts.ttShift) {
      pointerStyle = ' style="' + (vk.rtl ? 'right' : 'left') + ': '+(114+opts.ttShift)+'px"';
    }
    var tabs = '<span class="'+(cur.emoji_stickers ? 'emoji_tabs_cont' : '')+'">';
    if (cur.emoji_stickers !== false && cur.emoji_stickers !== undefined) {
      cur.stickersTab = 0;
      tabs += Emoji.getTabsCode(cur.emoji_stickers, optId);
      var classAddr = '';
    } else {
      var classAddr = ' emoji_no_tabs';
    }
    cur.stickersTab = 0;
    tabs += '</span><a class="fl_r emoji_shop" onclick="Emoji.showStickersStore('+optId+');"><div class="emoji_sprite emoji_shop_icon"></div></a>';
    var tt = ce('div', {
      id: 'emoji_block_'+optId,
      className: 'emoji_tt_wrap'+(!Emoji.showShadow() ? ' emoji_no_opacity' : '')+classAddr,
      innerHTML: '<div class="emoji_sprite emoji_pointer"'+pointerStyle+'></div><div class="emoji_block_cont"><div class="emoji_tabs clear_fix">'+tabs+'</div><div class="emoji_sprite emoji_expand_shadow"></div><div class="emoji_sprite emoji_expand_shadow_top"></div><div class="emoji_list_cont"><div class="emoji_list"><div class="emoji_scroll">'+Emoji.ttEmojiList(optId)+'</div></div></div></div>'
    });
    opts.tt = tt;
    Emoji.reappendEmoji(optId, tt);
    Emoji.emojiOver(optId, geByClass1('emoji_scroll', tt).firstChild);

    if (opts.sharedTT) {
      opts.sharedTT.emojiTT = tt;
    }
  }
  clearTimeout(opts.ttEmojiHide);

  if (Emoji.shownId !== false && Emoji.shownId != optId) {
    Emoji.ttClick(Emoji.shownId, geByClass1('emoji_smile', Emoji.opts[Emoji.shownId].controlsCont), true);
  }
  var topShift = 178;
  if (Emoji.shown) {
    var toParams = {marginTop: -(topShift+10), opacity: 0};
    if (Emoji.cssAnimation()) {
      addClass(tt, 'emoji_animation');
      setStyle(tt, toParams);
      opts.ttEmojiHide = setTimeout(function() {
        removeClass(tt, 'emoji_animation');
        hide(tt);
      }, 1000);
    } else {
      setTimeout(function() {
        animate(tt, toParams, 200, function() {
          hide(tt);
        });
      }, 10);
    }
    Emoji.shown = false;
    Emoji.shownId = false;
    opts.emojiFocused = false;
    cur.onMouseClick = false;
    removeEvent(document, 'keydown', Emoji.emojiMove);
    if (cur.peer == -3) {
      Emoji.anim(obj, 0);
    } else {
      addClass(obj, 'emoji_smile_animation');
      clearTimeout(opts.imSmileAnim);
      opts.imSmileAnim = setTimeout(removeClass.pbind(obj, 'emoji_smile_animation'), 1000);
      removeClass(obj, 'emoji_smile_on');
    }
    if (opts.onHide) {
      opts.onHide();
    }
  } else {
    show(tt);
    var toParams = {marginTop: -topShift, opacity: 1};
    if (Emoji.cssAnimation()) {
      addClass(tt, 'emoji_animation');
      setTimeout(setStyle.pbind(tt, toParams), 100);
    } else {
      setTimeout(function() {
        show(tt);
        animate(tt, toParams, 200);
      }, 10);
    }
    Emoji.shownId = optId;
    Emoji.shown = obj;
    cur.emojiList = geByClass1('emoji_list', tt);
    opts.emojiFocused = true;
    setTimeout(function() {
      cur.onMouseClick = function(e) {
        var el = e.target;
        while(el) {
          if (el.id == 'im_texts' || hasClass(el, 'emoji_tt_wrap') || hasClass(el, 'imw_emoji_wrap')) {
            return false;
          }
          el = el.parentNode;
        }
        Emoji.ttClick(optId, false, true);
      }
      addEvent(document, 'keydown', Emoji.emojiMove);
    }, 0);
    if (cur.peer == -3) {
      Emoji.anim(obj, 1);
    } else {
      addClass(obj, 'emoji_smile_animation')
      clearTimeout(opts.imSmileAnim);
      opts.imSmileAnim = setTimeout(removeClass.pbind(obj, 'emoji_smile_animation'), 1000);
      addClass(obj, 'emoji_smile_on');
    }
    if (opts.emojiScroll && opts.emojiExpanded) {
      opts.emojiScroll.update(false, true);
    }
    if (opts.onShow) {
      opts.onShow();
    }
  }
  if (!opts.emojiExpanded) {
    Emoji.emojiExpand(optId, tt);
  }
  return cancelEvent(ev);
},
curEmojiSet: ['D83DDE0A', 'D83DDE03', 'D83DDE09', 'D83DDE06', 'D83DDE1C', 'D83DDE0B', 'D83DDE0D', 'D83DDE0E', 'D83DDE12', 'D83DDE0F', 'D83DDE14', 'D83DDE22', 'D83DDE2D', 'D83DDE29', 'D83DDE28', 'D83DDE10', 'D83DDE0C', 'D83DDE04', 'D83DDE07', 'D83DDE30', 'D83DDE32', 'D83DDE33', 'D83DDE37', 'D83DDE02', '2764', 'D83DDE1A', 'D83DDE15', 'D83DDE2F', 'D83DDE26', 'D83DDE35', 'D83DDE20',  'D83DDE21', 'D83DDE1D', 'D83DDE34', 'D83DDE18', 'D83DDE1F', 'D83DDE2C', 'D83DDE36', 'D83DDE2A', 'D83DDE2B', '263A', 'D83DDE00', 'D83DDE25', 'D83DDE1B', 'D83DDE16', 'D83DDE24', 'D83DDE23', 'D83DDE27', 'D83DDE11', 'D83DDE05', 'D83DDE2E', 'D83DDE1E', 'D83DDE19', 'D83DDE13', 'D83DDE01', 'D83DDE31', 'D83DDE08', 'D83DDC7F', 'D83DDC7D', 'D83DDC4D', 'D83DDC4E', '261D', '270C', 'D83DDC4C', 'D83DDC4F', 'D83DDC4A', '270B', 'D83DDE4F', 'D83DDC43', 'D83DDC46', 'D83DDC47', 'D83DDC48', 'D83DDCAA', 'D83DDC42', 'D83DDC8B', 'D83DDCA9', '2744', 'D83CDF4A', 'D83CDF77', 'D83CDF78', 'D83CDF85', 'D83DDCA6', 'D83DDC7A', 'D83DDC28', 'D83DDD1E', 'D83DDC79', '26BD', '26C5', 'D83CDF1F', 'D83CDF4C', 'D83CDF7A', 'D83CDF7B', 'D83CDF39', 'D83CDF45', 'D83CDF52', 'D83CDF81', 'D83CDF82', 'D83CDF84', 'D83CDFC1', 'D83CDFC6', 'D83DDC0E', 'D83DDC0F', 'D83DDC1C', 'D83DDC2B', 'D83DDC2E', 'D83DDC03', 'D83DDC3B', 'D83DDC3C', 'D83DDC05', 'D83DDC13', 'D83DDC18', 'D83DDC94', 'D83DDCAD', 'D83DDC36', 'D83DDC31', 'D83DDC37', 'D83DDC11', '23F3', '26BE', '26C4', '2600', 'D83CDF3A', 'D83CDF3B', 'D83CDF3C', 'D83CDF3D', 'D83CDF4B', 'D83CDF4D', 'D83CDF4E', 'D83CDF4F', 'D83CDF6D', 'D83CDF37', 'D83CDF38', 'D83CDF46', 'D83CDF49', 'D83CDF50', 'D83CDF51', 'D83CDF53', 'D83CDF54', 'D83CDF55', 'D83CDF56', 'D83CDF57', 'D83CDF69', 'D83CDF83', 'D83CDFAA', 'D83CDFB1', 'D83CDFB2', 'D83CDFB7', 'D83CDFB8', 'D83CDFBE', 'D83CDFC0', 'D83CDFE6', 'D83DDE38'],
curEmojiKeys: {},
emojiShowMore: function(optId) {
  debugLog('show emoji more');
  var opts = Emoji.opts[optId];
  if (opts.curTab) {
    return;
  }
  if (Emoji.allEmojiCodes) {
    debugLog('show emoji more all', opts.allEmojiId);
    var code;
    var shown = 0;
    var cont = geByClass1('emoji_scroll', opts.tt);
    var str = '';
    re('im_emoji_progress');
    while(code = Emoji.allEmojiCodes[opts.allEmojiId]) {
      opts.allEmojiId += 1;
      if (opts.sharedTT) {
        opts.sharedTT.emojiAllId = opts.allEmojiId;
      }
      if (Emoji.curEmojiKeys[code]) {
        continue;
      }
      str += Emoji.emojiWrapItem(optId, code);
      shown += 1;
      if (shown > 128) {
        break;
      }
    }
    if (str) {
      cont.appendChild(cf(str));
      opts.emojiScroll.update(false, true)
    }
  } else {
    cur.onEmojiLoad = Emoji.emojiShowMore.pbind(optId);
  }
},

emojiLoadMore: function(optId) {
  var opts = Emoji.opts[optId];
  debugLog('load more');
  opts.emojiMoreSt = 1;
  if (Emoji.allEmojiCodes) {
    opts.allEmojiId = 0;
    if (opts.sharedTT) {
      opts.sharedTT.emojiAllId = 0;
    }
    if (cur.onEmojiLoad) {
      cur.onEmojiLoad();
    }
  } else {
    ajax.post('im', {act: 'get_emoji_list'}, {
      onDone: function(codes, stickers) {
        Emoji.stickers = stickers;
        opts.allEmojiId = 0;
        if (opts.sharedTT) {
          opts.sharedTT.emojiAllId = 0;
        }
        Emoji.allEmojiCodes = codes;
        if (cur.onEmojiLoad) {
          cur.onEmojiLoad();
        }
        if (Emoji.onStickersLoad) {
          Emoji.onStickersLoad();
          Emoji.onStickersLoad = false;
        }
      }
    })
  }
},

ttEmojiList: function(optId) {
  var list = [];
  var ems = Emoji.curEmojiSet;
  var recent = [];
  var recentList = {};

  for (var i in ems) {
    var code = ems[i];
    Emoji.curEmojiKeys[code] = 1;
    var str = Emoji.emojiWrapItem(optId, code, i);
    list.push(str);
  }
  if (recent.length) {
    list.unshift.apply(list, recent);
  }
  var loadingEl = '<div align="center" id="im_emoji_progress"><span class="progress_inline progress_gray"></span></div>';

  return list.join('')+loadingEl;
},

emojiWrapItem: function(optId, code, i) {
  var info = Emoji.cssEmoji[code];
  if (info) {
    var titleStr = ' title="'+info[1]+'"';
  } else {
    var titleStr = '';
  }
  if (browser.mobile) {
    var overEvent = '';
  } else {
    var overEvent = ' onmouseover="return Emoji.emojiOver('+optId+', this);"';
  }
  return '<a class="emoji_smile_cont '+((code != '2764' && i && (i < 54)) ? 'emoji_smile_shadow' : '')+'" '+titleStr+' onmousedown="Emoji.addEmoji(Emoji.shownId, \''+code+'\', this); return cancelEvent(event);" onclick="return cancelEvent(event);"'+overEvent+'><div class="emoji_bg"></div><div class="emoji_shadow"></div>'+Emoji.getEmojiHTML(code)+'</a>'
},

reappendEmoji: function(optId, tt) {
  var opts = Emoji.opts[optId];
  if (opts && opts.rceCont) {
    if (!opts.addMediaBtn) {
      opts.sendWrap.appendChild(opts.rceCont);
    } else {
      opts.sendWrap.insertBefore(opts.rceCont, opts.addMediaBtn);
    }
  }
  if (!tt) return;
  var controls = opts.controlsCont;
  var diff = opts.isSized ? sbWidth() : 0;

  controls.insertBefore(tt, domFC(controls));
  diff += opts.ttDiff;
  if (opts.ttShift) {
    diff += opts.ttShift;
  }
  setStyle(tt, vk.rtl ? {left: diff} : {right: diff});
  clearTimeout(cur.ttEmojiHide);
  hide(tt);
},
emojiOver: function(optId, obj) {
  if (browser.mobile) {
    return true;
  }
  var opts = Emoji.opts[optId]
  addClass(obj, 'emoji_over');
  if (opts.emojiOvered && opts.emojiOvered != obj) {
    removeClass(opts.emojiOvered, 'emoji_over');
  }
  opts.emojiOvered = obj;
  Emoji.emojiOpera(optId);
},
emojiOpera: function(optId) { // fuck opera!
  if (browser.opera && !browser.mobile) {
    var tt = Emoji.opts[optId].tt;
    animate(tt, {opacity: 0.99}, 20, animate.pbind(tt, {opacity: 1}, 20));
  }
},
emojiExpand: function(optId, block) {
  var opts = Emoji.opts[optId];
  var list = geByClass1('emoji_list', block);
  if (Emoji.cssAnimation()) {
    removeClass(block, 'emoji_animation')
  }
  addClass(block, 'emoji_expanded');

  Emoji.emojiLoadMore(optId);

  if (opts.emojiScroll) {
    opts.emojiScroll.enable()
  } else {
    var topShown = false;
    var bottomShown = false;
    opts.emojiScroll = new Scrollbar(list, {
      prefix: 'emoji_',
      nomargin: true,
      global: true,
      nokeys: true,
      right: vk.rtl ? 'auto' : 10,
      left: !vk.rtl ? 'auto' : 10,
      scrollChange: function(top) {
        if (window.tooltips) {
          tooltips.destroyAll();
          cur.ttScrollTime = new Date().getTime();
        }
        if (Emoji.showShadow()) {
          if (top && !topShown) {
            show(geByClass1('emoji_expand_shadow_top', opts.tt));
            topShown = true;
          } else if (!top && topShown) {
            topShown = false;
            hide(geByClass1('emoji_expand_shadow_top', opts.tt));
          }
        }
        /*if (top > 10 && !opts.emojiMoreSt) {
          Emoji.emojiLoadMore(optId);
        }*/
        Emoji.emojiOpera(optId);
      },
      more: Emoji.emojiShowMore.pbind(optId)
    });

    if (opts.sharedTT) {
      opts.sharedTT.emojiScroll = opts.emojiScroll;
    }
  }
  opts.emojiExpanded = true;
},

emojiMove: function(e) {
  var optId = Emoji.shownId;
  var opts = Emoji.opts[optId];
  if (Emoji.shown && opts.emojiFocused) {
    var el = opts.emojiOvered;
    switch (e.keyCode) {
      case KEY.LEFT:
        el = el.previousSibling;
        break;
      case KEY.RIGHT:
        el = el.nextSibling;
        break;
      case KEY.UP:
        var i = 9;
        while (el.previousSibling && --i > 0) {
          el = el.previousSibling;
        }
        if (i > 1) {
          return cancelEvent(e);
        }
        break;
      case KEY.DOWN:
        var i = 9;
        while (el.nextSibling && --i > 0) {
          el = el.nextSibling;
        }
        if (i > 1) {
          return cancelEvent(e);
        }
        break;
      case KEY.ENTER:
        return Emoji.emojiEnter(optId, e);
        break;
      default:
        return true;
    }
    if (el) {
      var diff = el.offsetTop - cur.emojiList.scrollTop;
      if (diff > 72) {
        animate(cur.emojiList, {scrollTop: cur.emojiList.scrollTop + (diff - 72)}, 80, function() {
          opts.emojiScroll.update(true, true)
        });
      } else if (diff < 0) {
        animate(cur.emojiList, {scrollTop: cur.emojiList.scrollTop + diff}, 80, function() {
          opts.emojiScroll.update(true, true)
        });
      }
      Emoji.emojiOver(optId, el);
    }
    return cancelEvent(e);
  }
  return true;
},

anim: function(el, to) {
  clearInterval(cur._imAnim);
  var dt = 300, dStep = 45 / (dt / 13), oStep = 1 / (dt / 13), steps = Math.floor(dt / 13), i = 0;
  var el1 = domLC(el), el2 = domFC(el);
  var dFrom1 = to ? 0 : 45, dTo1 = to ? 45 : 0, oFrom1 = to ? 1 : 0, oTo1 = to ? 0 : 1;
  cur._imAnim = setInterval(function() {
    ++i;
    var d1 = (i >= steps) ? dTo1 : (dFrom1 + dStep * i * (to ? 1 : -1)), d2 = d1 - 45;
    var o1 = (i >= steps) ? oTo1 : (oFrom1 + oStep * i * (to ? -1 : 1)), o2 = 1 - o1;
    el1.style.WebkitTransform = el1.style.OTransform = el1.style.transform = 'rotate(' + d1 + 'deg)';
    el2.style.WebkitTransform = el2.style.OTransform = el2.style.transform = 'rotate(' + d2 + 'deg)';
    el1.style.opacity = o1;
    el2.style.opacity = o2;
    if (i >= steps) {
      clearInterval(cur._imAnim);
      (to ? addClass : removeClass)(el, 'emoji_smile_on');
      el1.style.WebkitTransform = el1.style.OTransform = el1.style.transform = el2.style.WebkitTransform = el2.style.OTransform = el2.style.transform = el1.style.opacity = el2.style.opacity = '';
    }
  }, 13);
},
cssAnimation: function() {
  var v = intval(browser.version);
  if ((browser.chrome && v > 14) || (browser.mozilla && v > 13) || (browser.opera && v > 2)) {
    return (cur.peer != -3);
  }
  return false;
},
ttOver: function(obj) {
  animate(obj, {opacity: 1}, 200);
},
ttOut: function(obj) {
  animate(obj, {opacity: 0.7}, 200);
},
tplSmile: function(optId, placeholder, classAddr) {
  return '<div title="'+placeholder+'" class="fl_l emoji_smile'+classAddr+'" onmouseover="Emoji.ttOver(this);" onmouseout="Emoji.ttOut(this);" onmousedown="return Emoji.ttClick('+optId+', this, false, false, event);" onclick="return cancelEvent(event);" style="right: 1px; opacity: 0.7;"><div class="emoji_smile_icon_on"></div><div class="emoji_smile_icon"></div></div>'
},


emojiToHTML: function(str, replaceSymbols) {
  if (browser.ipad || browser.iphone) {
    return str;
  }
  str = str.replace(/&nbsp;/g, ' ').replace(/<br>/g, "\n");
  var regs = {
    'D83DDE07': /(\s|^)([0O�]:\))([\s\.,]|$)/g,
    'D83DDE09': /(\s|^)(;-\)+)([\s\.,]|$)/g,
    'D83DDE06': /(\s|^)([X�x�]-?D)([\s\.,]|$)/g,
    'D83DDE0E': /(\s|^)(B-\))([\s\.,]|$)/g,
    'D83DDE0C': /(\s|^)(3-\))([\s\.,]|$)/g,
    'D83DDE20': /(\s|^)(&gt;\()([\s\.,]|$)/g,
    'D83DDE30': /(\s|^)(;[o�O�])([\s\.,]|$)/g,
    'D83DDE33': /(\s|^)(8\|)([\s\.,]|$)/g,
    'D83DDE32': /(\s|^)(8-?[o�O�])([\s\.,]|$)/g,
    'D83DDE0D': /(\s|^)(8-\))([\s\.,]|$)/g,
    'D83DDE37': /(\s|^)(:[X�])([\s\.,]|$)/g,
    'D83DDE28': /(\s|^)(:[o�O�])([\s\.,]|$)/g,
    '2764': /(\s|^)(&lt;3)([\s\.,]|$)/g
  };
  for (var code in regs) {
    str = str.replace(regs[code], function(match, pre, smile, space) {
      return (pre || '') + Emoji.getEmojiHTML(code)+(space || '');
    });
  }
  var regs = {
    'D83DDE0A': /(:-\))([\s\.,]|$)/g,
    'D83DDE03': /(:-D)([\s\.,]|$)/g,
    'D83DDE1C': /(;-[P�])([\s\.,]|$)/g,
    'D83DDE0B': /(:-[p�])([\s\.,]|$)/g,
    'D83DDE12': /(:-\()([\s\.,]|$)/g,
    'D83DDE0F': /(:-?\])([\s\.,]|$)/g,
    'D83DDE14': /(3-?\()([\s\.,]|$)/g,
    'D83DDE22': /(:&#039;\()([\s\.,]|$)/g,
    'D83DDE2D': /(:_\()([\s\.,]|$)/g,
    'D83DDE29': /(:\(\()([\s\.,]|$)/g,
    //'D83DDE15': /(:\\)([\s\.,]|$)/g,
    'D83DDE10': /(:\|)([\s\.,]|$)/g,
    'D83DDE21': /(&gt;\(\()([\s\.,]|$)/g,
    'D83DDE1A': /(:-\*)([\s\.,]|$)/g,
    'D83DDE08': /(\}:\))([\s\.,]|$)/g,
    'D83DDC4D': /(:like:)([\s\.,]|$)/g,
    'D83DDC4E': /(:dislike:)([\s\.,]|$)/g,
    '261D': /(:up:)([\s\.,]|$)/g,
    '270C': /(:v:)([\s\.,]|$)/g,
    'D83DDC4C': /(:ok:|:��:)([\s\.,]|$)/g
  };
  for (var code in regs) {
    str = str.replace(regs[code], function(match, smile, space) {
      return Emoji.getEmojiHTML(code)+(space || '');
    });
  }

  str = str.replace(/\n/g, '<br>');
  if (replaceSymbols) {
    str = str.replace(Emoji.emojiRegEx, Emoji.emojiReplace).replace(/\uFE0F/g, '');
  }

  return str;
},

emojiReplace: function(symbol) {
  var i = 0;
  var code = '', num;
  while(num = symbol.charCodeAt(i++)) {
    if (i == 2 && num == 8419) {
      code = '003'+symbol.charAt(0)+'20E3';
      break;
    }
    code += num.toString(16);
  }
  if (symbol.match(/[\uDDE7-\uDDFA]/)) {
    if (cur.flagSymbol) {
      code = cur.flagSymbol + code;
      cur.flagSymbol = false;
    } else {
      cur.flagSymbol = code;
      return '';
    }
  }
  code = code.toUpperCase();
  return Emoji.getEmojiHTML(code, symbol, true);
},

emojiRegEx: /([\uE000-\uF8FF\u270A-\u2764\u2122\u25C0\u25FB-\u25FE\u2615\u263a\u2648-\u2653\u2660-\u2668\u267B\u267F\u2693\u261d\u26A0-\u26FA\u2708]|\uD83C[\uDC00-\uDFFF]|[\u2600\u26C4\u26BE\u23F3\u2764]|\uD83D[\uDC00-\uDFFF]|\uD83C[\uDDE8-\uDDFA]\uD83C[\uDDEA-\uDDFA]|[0-9]\u20e3)/g,

getCode: function(obj) {
  var code = false;
  if (obj.className == 'emoji') {
    var m = obj.src.match(/\/([a-zA-Z0-9]+).png/);
    if (m) {
      var code = m[1];
    }
  } else if (obj.className == 'emoji_css') {
    var code = obj.getAttribute('emoji');
  }
  return code;
},

tabSwitch: function(obj, selId, optId) {
  if (!Emoji.stickers) {
    Emoji.onStickersLoad = Emoji.tabSwitch.pbind(obj, selId, optId);
    return false;
  }
  var opts = Emoji.opts[optId];
  var tt = opts.tt;

  var tabsCont = geByClass1('emoji_tabs', tt);
  var selEl = geByClass1('emoji_tab_sel', tabsCont);
  if (selEl == obj) {
    return;
  }
  removeClass(selEl, 'emoji_tab_sel');
  addClass(obj, 'emoji_tab_sel');
  opts.curTab = selId;

  var cont = geByClass1('emoji_scroll', tt);
  debugLog('selId', selId);
  var stickerSize = (window.devicePixelRatio >= 2) ? '128' : '48';
  if (selId) {
    var html = '';
    var pack = Emoji.stickers[selId];
    if (!pack) {
      return false;
    }
    var list = pack.stickers;
    var size = 48;
    var sizeDiv = 256 / size;
    for (var i in list) {
      debugLog('list', list[i]);
      html += '<a class="emoji_sticker_item" onclick="Emoji.stickerClick('+optId+', '+list[i][0]+');"><img width="'+parseInt(list[i][1] / sizeDiv)+'" height="'+size+'" src="/images/stickers/'+list[i][0]+'/'+stickerSize+'.png" /></a>';
    }
  } else {
    var html = Emoji.ttEmojiList(optId);
  }
  cont.innerHTML = html;
  opts.emojiScroll.scrollTop();
  opts.emojiScroll.update();
},

stickerClick: function(optId, stickerNum) {
  var opts = Emoji.opts[optId];
  if (opts.onStickerSend) {
    opts.onStickerSend(stickerNum);
  }
  Emoji.ttHide(optId);
},

showStickersStore: function(optId) {
  cur.boxStickersStore = showBox('al_im.php', {act: 'stickers_store'}, {dark: 1, stat: ['im.css', 'im.js', 'page_help.css', 'sorter.js']});
},

previewSticker: function(packId, obj) {
  if (obj) {
    cur.stickersDepEl = geByClass1('im_sticker_act_blue', obj);
  } else {
    cur.stickersDepEl = false;
  }
  cur.boxStickersPreview = showBox('al_im.php', {act: 'sticker_preview', pack_id: packId}, {dark: 1, stat: ['im.css', 'im.js']});
},

buyStickers: function(packId, ev, obj, hash) {
  if (obj) {
    var back = obj.innerHTML;
  }
  ajax.post('/al_im.php', {act: 'a_stickers_buy', pack_id: packId, hash: hash}, {
    onDone: function(text, newStickers, btnText) {
      if (hasClass(obj, 'im_sticker_act_blue')) {
        removeClass(obj, 'im_sticker_act_blue')
        obj.innerHTML = btnText;
        setStyle(obj, {width: 'auto'});
      }
      if (cur.stickersDepEl) {
        cur.stickersDepEl.innerHTML = btnText;
        setStyle(cur.stickersDepEl, {width: 'auto'});
        removeClass(cur.stickersDepEl, 'im_sticker_act_blue')
      }
      if (cur.boxStickersPreview) {
        cur.boxStickersPreview.hide();
      }
      /*if (cur.boxStickersStore) {
        cur.boxStickersStore.hide();
      }*/
      showDoneBox(text);
      if (newStickers) {
        Emoji.updateTabs(newStickers);
      }
      var box = cur.tabbedStickersBox;
      if (box && box.tbUpdate) {
        for (var i in box.tbUpdate) {
          box.tbUpdate[i] = 1;
        }
      }

      var optId = cur.emojiId[cur.peer];
      var tabEl = geByClass1('emoji_tab_'+packId, Emoji.opts[optId].tt);
      if (tabEl) {
        Emoji.tabSwitch(tabEl, packId, optId);
      }
    },
    showProgress: function() {
      if (obj) {
        obj.innerHTML = '<div class="progress_inline progress_inv im_stickers_progress" /></div>';
      }
    },
    hideProgress: function() {
      if (obj) {
        obj.innerHTML = back;
      }
    },
    onFail: function(text) {
      if (text) {
        setTimeout(showFastBox(getLang('global_error'), text).hide, 3000);
      }
      return true;
    }
  });
  return cancelEvent(ev);
},

stickerAct: function(obj, packId, hash, ev, fromBtn) {
  if (fromBtn && !hasClass(obj, 'im_sticker_act_blue')) {
    return true;
  }
  var back = obj.innerHTML;
  if (hasClass(obj, 'im_sticker_activated')) {
    state = 1;
  } else {
    state = 0;
  }
  var box = cur.tabbedStickersBox;
  for (var i in box.tbUpdate) {
    box.tbUpdate[i] = 1;
  }
  ajax.post('/al_im.php', {act: 'a_stickers_switch', pack_id: packId, hash: hash, state: state, from_btn: fromBtn ? 1 : 0}, {
    onDone: function(text, newStickers) {
      obj.innerHTML = text;
      setStyle(obj, {width: 'auto'});
      toggleClass(obj, 'im_sticker_activated', !state);
      if (fromBtn) {
        removeClass(obj, 'im_sticker_act_blue')
      }
      if (cur.stickersDepEl) {
        cur.stickersDepEl.innerHTML = text;
        setStyle(cur.stickersDepEl, {width: 'auto'});
        toggleClass(cur.stickersDepEl, 'im_sticker_activated', !state);
        removeClass(cur.stickersDepEl, 'im_sticker_act_blue')
      }
      Emoji.updateTabs(newStickers);
      var el = obj.parentNode.parentNode;
      if (fromBtn) {
        return;
      }
      cur.stickersSorter.destroy();
      if (state) {
        show('im_stickers_deact');
        var newCont = ge('im_stickers_deact_wrap');
        if (newCont.firstChild) {
          newCont.insertBefore(el, newCont.firstChild)
        } else {
          newCont.appendChild(el);
        }
        setStyle(el, {cursor: 'default'})
      } else {
        var newCont = ge('im_stickers_my_wrap');
        newCont.appendChild(el);
        var oldCont = ge('im_stickers_deact_wrap');
        if (!oldCont.childNodes.length) {
          hide('im_stickers_deact');
        }
      }
      Emoji.fixFirstEl(ge('im_stickers_deact_wrap'));
      Emoji.fixFirstEl(ge('im_stickers_my_wrap'));
      cur.stickersSorterInit();
    },
    showProgress: function() {
      var width = getSize(obj)[0] - intval(getStyle(obj, 'paddingLeft')) - intval(getStyle(obj, 'paddingRight'));
      setStyle(obj, {width: width});
      obj.innerHTML = '<center><div class="progress_inline'+(fromBtn ? ' progress_inv' : '')+' im_stickers_progress" /></div></center>';
    },
    hideProgress: function() {
      obj.innerHTML = back;
    }
  });
  return cancelEvent(ev);
},

getTabsCode: function(newStickers, optId) {
  var html = '';
  var stickers = [[0, 1]];
  if (newStickers) {
    stickers.push.apply(stickers, newStickers);
  }
  for (var i in stickers) {
    var stNum = stickers[i][0];
    var isActive = stickers[i][1];
    if (isActive) {
      var act = 'return Emoji.tabSwitch(this, '+stNum+', '+optId+');';
    } else {
      var act = 'return Emoji.previewSticker('+stNum+');';
    }
    if (stNum) {
      html += '<a class="fl_l emoji_tab emoji_tab_img_cont emoi_tab_'+stNum+' emoji_tab_' + stNum + (cur.stickersTab == stNum ? ' emoji_tab_sel' : '') + (isActive ? '' : ' emoji_tab_promo')+'" onclick="'+act+'"><img width="22" height="22" src="/images/store/stickers/'+stNum+'/tab_'+(window.devicePixelRatio >= 2 ? '44' : '22')+'.png" class="emoji_tab_img"/></a>';
    } else {
      html += '<a class="fl_l emoji_tab emoji_tab_'+stNum+(cur.stickersTab == stNum ? ' emoji_tab_sel' : '')+(isActive ? '' : ' emoji_tab_promo')+'" onclick="'+act+'"><div class="emoji_tab_icon emoji_sprite emoji_tab_icon_'+stNum+'"></div></a>';
    }
  }
  return html;
},

updateTabs: function(newStickers) {
  cur.emoji_stickers = newStickers;
  for (var i in Emoji.opts) {
    var opts = Emoji.opts[i];
    var html = Emoji.getTabsCode(newStickers, i);
    var tabsCont = geByClass1('emoji_tabs_cont', opts.tt);
    if (tabsCont) {
      tabsCont.innerHTML = html;
    }
  }
},

fixFirstEl: function(cont) {
  debugLog('cont', cont);
  var firstClassEls = geByClass('im_stickers_my_first', cont);
  for(var i in firstClassEls) {
    removeClass(firstClassEls[i], 'im_stickers_my_first');
  }
  var newFirstEl = geByClass1('im_stickers_my_row', cont);
  addClass(newFirstEl, 'im_stickers_my_first');
},

__eof: 1}}
try{stManager.done('emoji.js');}catch(e){}
