import type { LucideIcon } from 'lucide-react'
export function PageHeader({icon:Icon,title,subtitle,actions}:{icon:LucideIcon,title:string,subtitle:string,actions?:React.ReactNode}){return <div className="pageHead"><div className="pageTitle"><div className="pageIcon"><Icon size={22}/></div><div><h1>{title}</h1><p>{subtitle}</p></div></div>{actions&&<div className="toolbar">{actions}</div>}</div>}
