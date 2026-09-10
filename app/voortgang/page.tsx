'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Voortgang() {
  const router = useRouter()
  const [aantal, setAantal] = useState(0)
  const [laden, setLaden] = useState(true)
  const [bericht, setBericht] = useState('')

  async function laadVoortgang() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) {
      router.push('/login')
      return
    }
    const { data, error } = await supabase
      .from('voortgang')
      .select('id')
      .eq('user_id', user.id)

    if (!error && data) {
      setAantal(data.length)
    }
    setLaden(false)
  }

  useEffect(() => {
    laadVoortgang()
  }, [])

  async function trainingAfgerond() {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) {
      router.push('/login')
      return
    }
    const { error } = await supabase.from('voortgang').insert({ user_id: user.id })
    if (error) {
      setBericht('Er ging iets mis: ' + error.message)
    } else {
      setBericht('Training genoteerd!')
      laadVoortgang()
    }
  }

  function motivatieTekst(n: number) {
    if (n === 0) return 'Nog geen training gelogd. Zet vandaag de eerste stap.'
    if (n < 3) return `Je hebt ${n} keer getraind. Mooie start, blijf dit volhouden.`
    if (n < 10) return `Je hebt al ${n} keer getraind. Je bent bezig een gewoonte te bouwen.`
    return `Indrukwekkend: ${n} trainingen gelogd. Dit is al een echt ritme.`
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Voortgang</h1>
      {laden ? (
        <p>Laden...</p>
      ) : (
        <>
          <p>Aantal trainingen gelogd: <strong>{aantal}</strong></p>
          <p>{motivatieTekst(aantal)}</p>
          <button onClick={trainingAfgerond}>Training afgerond</button>
          <p>{bericht}</p>
        </>
      )}
    </div>
  )
}