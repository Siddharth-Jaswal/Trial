import { useState } from 'react'
import Upload from '../components/Upload.jsx'
import ScheduleSetup from '../components/ScheduleSetup.jsx'

export default function Prescription(){
  const [result,setResult]=useState('')
  const [extracted,setExtracted]=useState(null)

  return (
    <div className="min-h-[70vh] grid md:grid-cols-2 gap-4">
      <Upload setExtracted={setExtracted} result={result} setResult={setResult} />
      <ScheduleSetup extracted={extracted} />
    </div>
  )
}


