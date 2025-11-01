import { useState } from 'react'
import api from '../api/axios.js'

export function Register(){
  const [username,setUsername]=useState('')
  const [email,setEmail]=useState('')
  const [phone,setPhone]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')

  const onSubmit=async(e)=>{
    e.preventDefault()
    setMsg('')
    try{
      const res=await api.post('/users/register',{username,email,phone,password})
      const data=res.data
      if(data.status===201){
        setMsg('Registered, now login')
      }else{
        setMsg(data.message||'Register failed')
      }
    }catch(err){
      setMsg('Error: '+err.message)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-blue-300 mb-4 text-center">Register</h2>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="phone" value={phone} onChange={e=>setPhone(e.target.value)} />
          <input className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2" type="submit">Register</button>
        </form>
        {msg && <p className="text-sm text-blue-300 mt-3 text-center">{msg}</p>}
      </div>
    </div>
  )
}


