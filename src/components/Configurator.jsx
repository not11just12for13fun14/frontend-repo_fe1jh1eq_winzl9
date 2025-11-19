import React, { useEffect, useMemo, useState } from 'react'
import Stepper from './Stepper'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Configurator() {
  const [step, setStep] = useState(0)

  // Catalog data
  const [vehicles, setVehicles] = useState([])
  const [colors, setColors] = useState([])
  const [upholsteries, setUpholsteries] = useState([])
  const [factoryOptions, setFactoryOptions] = useState([])
  const [accessories, setAccessories] = useState([])

  // Selections
  const [vehicleId, setVehicleId] = useState(null)
  const [colorCode, setColorCode] = useState(null)
  const [upholsteryCode, setUpholsteryCode] = useState(null)
  const [options, setOptions] = useState([])
  const [accs, setAccs] = useState([])
  const [special, setSpecial] = useState('')
  const [customer, setCustomer] = useState({ first_name: '', last_name: '', email: '', company: '', phone: '' })

  // Derived price
  const total = useMemo(() => {
    const v = vehicles.find(v => v.id === vehicleId)
    const c = colors.find(c => c.code === colorCode)
    const u = upholsteries.find(u => u.code === upholsteryCode)
    const opts = factoryOptions.filter(o => options.includes(o.code))
    const acs = accessories.filter(a => accs.includes(a.code))
    const sum = (v?.base_price || 0) + (c?.price || 0) + (u?.price || 0) + opts.reduce((s, o) => s + o.price, 0) + acs.reduce((s, a) => s + a.price, 0)
    return sum
  }, [vehicles, colors, upholsteries, factoryOptions, accessories, vehicleId, colorCode, upholsteryCode, options, accs])

  useEffect(() => {
    const fetchAll = async () => {
      const endpoints = [
        '/api/catalog/vehicles',
        '/api/catalog/colors',
        '/api/catalog/upholsteries',
        '/api/catalog/factory-options',
        '/api/catalog/accessories'
      ]
      const [v, c, u, fo, a] = await Promise.all(endpoints.map(e => fetch(`${apiBase}${e}`).then(r => r.json())))
      setVehicles(v); setColors(c); setUpholsteries(u); setFactoryOptions(fo); setAccessories(a)
    }
    fetchAll()
  }, [])

  const toggle = (list, setList, code) => {
    setList(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code])
  }

  const canNext = () => {
    switch (step) {
      case 0: return !!vehicleId
      case 1: return !!colorCode && !!upholsteryCode
      default: return true
    }
  }

  const submit = async () => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    const color = colors.find(c => c.code === colorCode)
    const up = upholsteries.find(u => u.code === upholsteryCode)
    const payload = {
      configuration: {
        vehicle_id: vehicleId,
        vehicle_name: vehicle?.name || '',
        color_code: colorCode,
        color_name: color?.name || '',
        upholstery_code: upholsteryCode,
        upholstery_name: up?.name || '',
        factory_options: options,
        accessories: accs,
        special_agreement: special || null,
        customer: customer,
        total_price: total
      }
    }

    const res = await fetch(`${apiBase}/api/offers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(`Fehler beim Senden: ${res.status} ${err.detail || ''}`)
      return
    }
    const data = await res.json()
    setStep(6)
    alert(`Angebot erstellt. ID: ${data.offer_id}\nGesamt: ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(data.total_price)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Angebotskonfigurator Nutzfahrzeuge</h1>
          <p className="text-slate-300">Konfigurieren Sie Ihr Fahrzeug Schritt für Schritt und senden Sie Ihre Anfrage.</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur">
          <Stepper current={step} />

          {/* Step content */}
          <div className="mt-6">
            {step === 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">1. Fahrzeug auswählen</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map(v => (
                    <button key={v.id} onClick={() => setVehicleId(v.id)} className={`text-left p-4 rounded-xl border transition ${vehicleId === v.id ? 'border-blue-400 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                      <div className="font-medium">{v.name}</div>
                      <div className="text-slate-300">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v.base_price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">2. Farbe wählen</h2>
                  <div className="space-y-2">
                    {colors.map(c => (
                      <label key={c.code} className={`flex items-center justify-between p-3 rounded-lg border ${colorCode === c.code ? 'border-blue-400 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border border-slate-600" style={{ backgroundColor: c.code === 'BLK' ? '#0f172a' : c.code === 'WHI' ? '#f1f5f9' : c.code === 'SLV' ? '#cbd5e1' : '#ef4444' }}></span>
                          <span>{c.name}</span>
                        </div>
                        <input type="radio" name="color" checked={colorCode === c.code} onChange={() => setColorCode(c.code)} />
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Polster wählen</h2>
                  <div className="space-y-2">
                    {upholsteries.map(u => (
                      <label key={u.code} className={`flex items-center justify-between p-3 rounded-lg border ${upholsteryCode === u.code ? 'border-blue-400 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                        <span>{u.name}</span>
                        <input type="radio" name="upholstery" checked={upholsteryCode === u.code} onChange={() => setUpholsteryCode(u.code)} />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">3. Sonderausstattung ab Werk</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {factoryOptions.map(o => (
                    <label key={o.code} className={`flex items-center justify-between p-3 rounded-lg border ${options.includes(o.code) ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                      <div>
                        <div className="font-medium">{o.name}</div>
                        <div className="text-slate-300 text-sm">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(o.price)}</div>
                      </div>
                      <input type="checkbox" checked={options.includes(o.code)} onChange={() => toggle(options, setOptions, o.code)} />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">4. Zubehör</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {accessories.map(o => (
                    <label key={o.code} className={`flex items-center justify-between p-3 rounded-lg border ${accs.includes(o.code) ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                      <div>
                        <div className="font-medium">{o.name}</div>
                        <div className="text-slate-300 text-sm">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(o.price)}</div>
                      </div>
                      <input type="checkbox" checked={accs.includes(o.code)} onChange={() => toggle(accs, setAccs, o.code)} />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">5. Sondervereinbarung</h2>
                <textarea value={special} onChange={e => setSpecial(e.target.value)} placeholder="z. B. Flottenkonditionen, Laufzeit, Hinweise" className="w-full h-32 p-3 rounded-lg bg-slate-900/60 border border-slate-700" />
              </div>
            )}

            {step === 5 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">6. Kundendaten</h2>
                  <div className="space-y-3">
                    {[
                      { key: 'first_name', label: 'Vorname' },
                      { key: 'last_name', label: 'Nachname' },
                      { key: 'company', label: 'Firma (optional)' },
                      { key: 'email', label: 'E-Mail' },
                      { key: 'phone', label: 'Telefon (optional)' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm mb-1">{f.label}</label>
                        <input value={customer[f.key] || ''} onChange={e => setCustomer(prev => ({ ...prev, [f.key]: e.target.value }))} className="w-full p-2 rounded-md bg-slate-900/60 border border-slate-700" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Zusammenfassung</h2>
                  <Summary
                    vehicles={vehicles}
                    colors={colors}
                    upholsteries={upholsteries}
                    vehicleId={vehicleId}
                    colorCode={colorCode}
                    upholsteryCode={upholsteryCode}
                    options={options}
                    accs={accs}
                    factoryOptions={factoryOptions}
                    accessories={accessories}
                    total={total}
                  />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold mb-2">Vielen Dank!</h2>
                <p className="text-slate-300">Ihre Anfrage wurde übermittelt. Wir melden uns zeitnah mit einem Angebot.</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          {step < 6 && (
            <div className="mt-8 flex items-center justify-between">
              <button disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))} className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 disabled:opacity-50">Zurück</button>
              <div className="text-slate-300">Gesamt: <span className="font-semibold">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(total)}</span></div>
              {step < 5 ? (
                <button disabled={!canNext()} onClick={() => setStep(s => s + 1)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50">Weiter</button>
              ) : (
                <button onClick={submit} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">Anfrage senden</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Summary({ vehicles, colors, upholsteries, vehicleId, colorCode, upholsteryCode, options, accs, factoryOptions, accessories, total }) {
  const v = vehicles.find(v => v.id === vehicleId)
  const c = colors.find(c => c.code === colorCode)
  const u = upholsteries.find(u => u.code === upholsteryCode)
  const opt = factoryOptions.filter(o => options.includes(o.code))
  const acs = accessories.filter(a => accs.includes(a.code))
  return (
    <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 space-y-2">
      <Row label="Fahrzeug" value={v?.name || '–'} />
      <Row label="Farbe" value={c?.name || '–'} />
      <Row label="Polster" value={u?.name || '–'} />
      <Row label="Werksoptionen" value={opt.length ? opt.map(o => o.name).join(', ') : '–'} />
      <Row label="Zubehör" value={acs.length ? acs.map(a => a.name).join(', ') : '–'} />
      <Row label="Gesamtpreis" value={new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(total)} />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
