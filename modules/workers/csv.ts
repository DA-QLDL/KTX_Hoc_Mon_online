import type { Worker } from './types'

export const VI_WORKER_HEADERS = [
  'STT','Họ và Tên','Mã NV','Tiểu Đoàn','Đơn vị','KTX','Dãy','Phòng','Giới tính','SĐT','CCCD','Ngày sinh',
  'Thôn/Xóm','Xã/Phường','Tỉnh/TP','Ngày Vào KTX','Ngày Ra KTX','Số Ngày Lưu Trú','Tổ Trưởng','SĐT Tổ Trưởng','Trạng thái tạm trú, Tạm vắng'
] as const

type WorkerImport = Partial<Worker> & { name: string }

const norm = (s:string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[đĐ]/g,'d').replace(/[^a-z0-9]+/g,' ').trim()

const ALIASES: Record<string,string> = {}
function alias(target:string, ...names:string[]){ for(const n of names) ALIASES[norm(n)] = target }

alias('_stt','STT','Số thứ tự','So thu tu','#')
alias('name','Họ và Tên','Họ tên','Ho va Ten','Ho ten','Name','Tên công nhân')
alias('mnv','Mã NV','Mã nhân viên','Ma NV','Ma nhan vien','MNV')
alias('battalion','Tiểu Đoàn','Tiểu đoàn','Tieu Doan','Tieu doan','battalion')
alias('unit','Đơn vị','Don vi','Unit')
alias('ktx','KTX','Ký túc xá','Ky tuc xa')
alias('day','Dãy','Day','Dãy nhà')
alias('room','Phòng','Phong','Room','Rom')
alias('gender','Giới tính','Gioi tinh','Gender')
alias('phone','SĐT','SDT','Số điện thoại','So dien thoai','Phone')
alias('cccd','CCCD','CMND/CCCD','Số CCCD','So CCCD')
alias('dob','Ngày sinh','Ngay sinh','DOB','Dob')
alias('village','Thôn/Xóm','Thon/Xom','Thôn','Xóm','Ấp','Ap')
alias('ward','Xã/Phường','Xa/Phuong','Xã','Phường')
alias('province','Tỉnh/TP','Tinh/TP','Tỉnh','Thành phố','Tinh thanh')
alias('check_in_date','Ngày Vào KTX','Ngày vào KTX','Ngay vao KTX','check_in_date','Check in date')
alias('check_out_date','Ngày Ra KTX','Ngày ra KTX','Ngay ra KTX','check_out_date')
alias('stay_days','Số Ngày Lưu Trú','Số ngày lưu trú','So ngay luu tru','stay_days')
alias('leader','Tổ Trưởng','Tổ trưởng','To Truong','To truong','leader')
alias('leader_phone','SĐT Tổ Trưởng','SDT Tổ Trưởng','SĐT tổ trưởng','SDT to truong','leader_phone')
alias('residence_status','Trạng thái tạm trú, Tạm vắng','Trạng thái tạm trú/Tạm vắng','Trạng thái tạm trú','Tạm vắng','residence_status')
alias('bed','Giường','Giuong','Bed')
alias('address','Địa chỉ','Dia chi','Address')

export function detectDelimiter(text:string){
  const first=(text.replace(/^\uFEFF/,'').split(/\r?\n/).find(Boolean)||'')
  const counts=[[';',first.split(';').length], [',',first.split(',').length], ['\t',first.split('\t').length]] as const
  return counts.sort((a,b)=>b[1]-a[1])[0][0]
}

export function parseCsv(text:string, delimiter=detectDelimiter(text)){
  text=text.replace(/^\uFEFF/,'')
  const rows:string[][]=[]; let row:string[]=[]; let cell=''; let quoted=false
  for(let i=0;i<text.length;i++){
    const ch=text[i]
    if(ch==='"'){
      if(quoted && text[i+1]==='"'){cell+='"';i++} else quoted=!quoted
    } else if(ch===delimiter && !quoted){row.push(cell);cell=''}
    else if((ch==='\n'||ch==='\r') && !quoted){
      if(ch==='\r'&&text[i+1]==='\n')i++
      row.push(cell);cell=''; if(row.some(x=>x.trim()!==''))rows.push(row);row=[]
    } else cell+=ch
  }
  if(cell.length||row.length){row.push(cell);if(row.some(x=>x.trim()!==''))rows.push(row)}
  return rows
}

function dateISO(v:string){
  v=(v||'').trim(); if(!v||/^null$/i.test(v))return null
  if(/^\d{4}-\d{2}-\d{2}$/.test(v))return v
  const m=v.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`
  const d=new Date(v); return isNaN(d.getTime())?null:d.toISOString().slice(0,10)
}
function clean(v:string){v=(v||'').trim();return !v||/^null$/i.test(v)?'':v}
function boolResidence(v:string){const x=norm(v);return x.includes('da dang ky')||x==='da dk'||x.includes('da khai bao')}
function numOrNull(v:string){const x=parseInt((v||'').replace(/[^0-9-]/g,''),10);return Number.isFinite(x)?x:null}

export type CsvPreview={
  headers:string[]; mapped:(string|null)[]; rows:WorkerImport[]; warnings:string[]; errors:string[]; ignoredHeaders:string[]
}

export function mapVietnameseWorkerCsv(text:string):CsvPreview{
  const raw=parseCsv(text); const errors:string[]=[];const warnings:string[]=[]
  if(raw.length<2)return {headers:raw[0]||[],mapped:[],rows:[],warnings,errors:['File CSV không có dữ liệu.'],ignoredHeaders:[]}
  const headers=raw[0].map(x=>x.trim());const mapped=headers.map(h=>ALIASES[norm(h)]||null)
  const ignoredHeaders=headers.filter((_,i)=>!mapped[i])
  if(ignoredHeaders.length)warnings.push(`Có ${ignoredHeaders.length} cột chưa nhận diện và sẽ bỏ qua: ${ignoredHeaders.join(', ')}`)
  if(!mapped.includes('name'))errors.push('Không tìm thấy cột “Họ và Tên”.')
  const rows:WorkerImport[]=[]
  raw.slice(1).forEach((r,idx)=>{
    const obj:any={}; headers.forEach((_,i)=>{const key=mapped[i];if(key&&key!=='_stt')obj[key]=clean(r[i]||'')})
    const name=clean(obj.name||''); if(!name){warnings.push(`Dòng ${idx+2}: thiếu Họ và Tên nên đã bỏ qua.`);return}
    const village=clean(obj.village),ward=clean(obj.ward),province=clean(obj.province)
    const address=clean(obj.address)||[village,ward,province].filter(Boolean).join(', ')
    const residence=clean(obj.residence_status)
    rows.push({
      name,mnv:clean(obj.mnv)||null,cccd:clean(obj.cccd)||null,phone:clean(obj.phone)||null,gender:clean(obj.gender)||null,
      dob:dateISO(obj.dob),unit:clean(obj.unit)||null,battalion:clean(obj.battalion)||null,leader:clean(obj.leader)||null,
      leader_phone:clean(obj.leader_phone)||null,ktx:clean(obj.ktx)||null,day:clean(obj.day)||null,room:clean(obj.room)||null,bed:clean(obj.bed)||null,
      village:village||null,ward:ward||null,province:province||null,address:address||null,
      temporary_residence:boolResidence(residence),residence_status:residence||null,
      check_in_date:dateISO(obj.check_in_date),check_out_date:dateISO(obj.check_out_date),stay_days:numOrNull(obj.stay_days)
    } as WorkerImport)
  })
  if(!rows.length&&!errors.length)errors.push('Không có dòng hợp lệ để nhập.')
  return {headers,mapped,rows,warnings,errors,ignoredHeaders}
}

export const VI_TO_DB_LABEL:Record<string,string>={
  'Họ và Tên':'name','Mã NV':'mnv','Tiểu Đoàn':'battalion','Đơn vị':'unit','KTX':'ktx','Dãy':'day','Phòng':'room',
  'Giới tính':'gender','SĐT':'phone','CCCD':'cccd','Ngày sinh':'dob','Thôn/Xóm':'village','Xã/Phường':'ward','Tỉnh/TP':'province',
  'Ngày Vào KTX':'check_in_date','Ngày Ra KTX':'check_out_date','Số Ngày Lưu Trú':'stay_days','Tổ Trưởng':'leader','SĐT Tổ Trưởng':'leader_phone',
  'Trạng thái tạm trú, Tạm vắng':'residence_status'
}
