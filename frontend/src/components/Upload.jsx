import { useState } from 'react'

export default function Upload({ setExtracted, result, setResult }){
  const [file,setFile]=useState(null)
  const [msg,setMsg]=useState('')

  const onUpload=async()=>{
    if(!file){ setMsg('Pick an image'); return }
    setMsg('')
    const form=new FormData()
    form.append('image',file)
    try{
      const res=await fetch('http://localhost:5000/extract',{ method:'POST', body:form })
      const data=await res.json()
      const text=(data.result||'').replace(/^```json\n|\n```$/g,'').trim()
      setResult(data.result||'')
      try{
        const parsed=JSON.parse(text)
        setExtracted(parsed)
      }catch{ /* leave parse error to user via result */ }
    }catch(err){ setMsg('Error: '+err.message) }
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-semibold text-blue-300">Upload Prescription</h2>
      <div className="flex items-center gap-3">
        <input className="text-slate-200" type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2" onClick={onUpload}>Scan</button>
      </div>
      {msg && <p className="text-sm text-blue-300">{msg}</p>}
      {result && (
        <pre className="p-3 bg-slate-950 border border-slate-800 rounded whitespace-pre-wrap text-slate-200">{result}</pre>
      )}
    </div>
  )
}


