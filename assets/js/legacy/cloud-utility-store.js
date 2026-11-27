/* Cloud utility storage: no browser-persisted business records. v1.0.97 */
(()=>{'use strict';
async function client(){if(window.parent===window||typeof parent.syncClient!=='function')throw Error('Mở tiện ích trong ứng dụng KTX sau khi đăng nhập');const sb=parent.syncClient();if(!sb)throw Error('Không có kết nối Supabase');const {data,error}=await sb.auth.getUser();if(error||!data?.user)throw Error('Phiên đăng nhập hết hạn');return {sb,user:data.user}}
const states=new Map();
async function fetch(moduleKey){const {sb}=await client();const {data,error}=await sb.from('ktx_utility_snapshots').select('revision,rows').eq('module_key',moduleKey).maybeSingle();if(error)throw error;const rows=data?.rows??[];if(!Array.isArray(rows))throw Error('Dữ liệu Cloud không hợp lệ');states.set(moduleKey,data?.revision??null);return structuredClone(rows)}
async function commit(moduleKey,rows){if(!Array.isArray(rows))throw Error('Dữ liệu không phải danh sách');const {sb,user}=await client();if(!states.has(moduleKey))throw Error('Chưa tải trạng thái Cloud, cần tải lại');const rev=states.get(moduleKey);let r;if(rev===null){r=await sb.from('ktx_utility_snapshots').insert({module_key:moduleKey,revision:1,rows,updated_by:user.id}).select('revision').single()}else{r=await sb.from('ktx_utility_snapshots').update({rows,revision:rev+1,updated_by:user.id,updated_at:new Date().toISOString()}).eq('module_key',moduleKey).eq('revision',rev).select('revision').maybeSingle();if(!r.error&&!r.data)throw Error('Dữ liệu đã đổi trên thiết bị khác; tải lại trước khi sửa')}
if(r.error)throw r.error;states.set(moduleKey,r.data.revision);return r.data.revision}
window.KTXCloudUtility={fetch,commit};
})();
