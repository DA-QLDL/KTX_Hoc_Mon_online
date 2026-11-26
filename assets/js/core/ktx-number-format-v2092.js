/* KTX v2.0.92 — consistent Vietnamese grouped quantity display (PC + Mobile).
   Formatting is presentation-only. Preserve identifiers, input fields, dates and payloads. */
(()=>{'use strict';
 const group=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
 const numberSlots='.kpi,[data-tot],.rc96-kpi b,.m173-kpi,.metric-value,.stat-value,.count-value,.dashboard-number,.meal-total,.total-value,.nav-count';
 const quantity=/\b(\d{4,})(?=\s*(?:suất|người|công nhân|hồ sơ|bản ghi|lượt|phòng|nhà cung cấp|NCC|mục|kết quả)(?:\s|[.,;!?]|$))/gi;
 function text(n){
   const p=n.parentElement;if(!p||p.closest('script,style,textarea,option,pre,code,[contenteditable],input,button[data-id],a[href^="tel:"]'))return;
   const raw=n.nodeValue;if(!raw||!/[0-9]{4}/.test(raw))return;
   let next=raw;
   if(p.closest(numberSlots))next=raw.replace(/(^|\s|\+)(\d{4,})(?=\s*$)/g,(m,start,num)=>start+group(num));
   // Group quantities with explicit unit, not arbitrary numbers such as employee IDs.
   next=next.replace(quantity,(_,digits)=>group(digits));
   if(next!==raw)n.nodeValue=next;
 }
 function scan(root){if(!root)return;const doc=root.ownerDocument||root;
  if(root.nodeType===3){text(root);return;}
  const walker=doc.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode())text(walker.currentNode);
 }
 let running=false;const pending=new Set();
 function schedule(node){pending.add(node.nodeType===3?node:node);if(running)return;running=true;queueMicrotask(()=>{running=false;for(const n of pending)if(n.isConnected)scan(n);pending.clear()});}
 function attach(doc){if(!doc||doc.__ktxGroupNumbersAttached)return;doc.__ktxGroupNumbersAttached=true;
   const start=()=>{if(!doc.body)return;scan(doc.body);new MutationObserver(muts=>{for(const m of muts){if(m.type==='characterData')schedule(m.target);else for(const n of m.addedNodes)if(n.nodeType===1||n.nodeType===3)schedule(n)}}).observe(doc.body,{childList:true,subtree:true,characterData:true});};
   if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',start,{once:true});else start();
 }
 attach(document);
 window.KTX_FORMAT_COUNT=n=>Number.isFinite(Number(n))?new Intl.NumberFormat('vi-VN',{maximumFractionDigits:0}).format(Number(n)):String(n??'');
})();
