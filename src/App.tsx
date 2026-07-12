import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import type { Item, GroupedItem, Role } from './types'
import {
  LoginScreen,
  ShipIcon,
  HelmIcon,
  LogoutIcon,
  ForbrugTab,
  OptaellingSkibTab,
  LagerOverblikTab,
  OptaellingMesterTab,
  BestillingskurvTab,
    AfventerLeveringTab,
  PluklisteTab,
  KassationTab
} from './components'
import { generateForsyningsblanket, generateLagerlistePDF } from './utils/pdfGenerator'

export default function App() {
  const [items, setItems] = useState<Item[]>([])
  const [originalItems, setOriginalItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSets, setExpandedSets] = useState<number[]>([])
  
  // Inline Bestilling State til "Overblik" fanen
  const [orderInputActive, setOrderInputActive] = useState<Record<number, { amount: number, lenh: string }>>({})

  // Auth states
  const [role, setRole] = useState<Role>(null)
  const [loginStep, setLoginStep] = useState<'role' | 'pin'>('role')
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [pin, setPin] = useState('')
  const [loginError, setLoginError] = useState('')

  // Tab states
  const [activeTab, setActiveTab] = useState<'forbrug' | 'optaelling_skib' | 'lager' | 'optaelling_mester' | 'bestilling' | 'afventer' | 'plukliste' | 'kassation'>('forbrug')

  // Transaction states for forms
  const [forbrug, setForbrug] = useState<Record<number, number>>({})
  const [godkendelser, setGodkendelser] = useState<Record<number, { amount: number, destination: 'skib' | 'container' }>>({})

  // Draft order states
  const [customOrderAmounts, setCustomOrderAmounts] = useState<Record<number, number>>({})
  const [orderSelected, setOrderSelected] = useState<Record<number, boolean>>({})

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('nr', { ascending: true })

      if (error) {
        console.error("Fejl ved hentning:", error)
        alert("Fejl fra databasen: " + error.message)
      } else {
        const formattedData = data?.map((item) => {
          const normRaw = String(item.mængde || item.Mængde || '0').replace(',', '.')
          const parsedNorm = parseFloat(normRaw) || 0

          return {
            id: item.nr || item.id,
            nr: item.nr,
            komponentnummer: String(item.komponentnummer || item.Komponentnummer || 'Mangler Varenr'),
            objektkorttekst: item.objektkorttekst || item.Objektkorttekst || 'Mangler Tekst',
            antal_skib: item.antal_skib || item.Antal_skib || 0,
            antal_container: item.antal_container || item.Antal_container || 0,
                        Koncernpris: String(item.koncernpris || item.Koncernpris || '0').replace(',', '.'),
            maengde: parsedNorm,
            bestilt: item.antal_bestilt || item.bestilt || item.Bestilt || 0,
            lenh: item.lenh || item.Lenh || 'EA',
            antal_retur: item.antal_retur || item.Antal_retur || 0,
            kassationsmetode: item.kassationsmetode || item.Kassationsmetode || ''
          }
        }) || []
        
        setItems(formattedData)
        setOriginalItems(JSON.parse(JSON.stringify(formattedData)))
      }
      setLoading(false)
    }
    fetchItems()
  }, [])

  const hasUnsavedChanges = items.some(item => {
    const original = originalItems.find(o => o.id === item.id)
    return original && (original.antal_skib !== item.antal_skib || 
                        original.antal_container !== item.antal_container ||
                        original.bestilt !== item.bestilt)
  })

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsaved = hasUnsavedChanges || Object.keys(forbrug).length > 0 || Object.keys(godkendelser).length > 0
      if (hasUnsaved) {
        e.preventDefault()
        e.returnValue = 'Du har ikke-gemte ændringer. Vil du stadig forlade siden?'
        return e.returnValue
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, forbrug, godkendelser])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === '0000') {
      setRole(selectedRole)
      setPin('')
      setLoginError('')
      setLoginStep('role')
      if (selectedRole === 'skib') setActiveTab('forbrug')
      if (selectedRole === 'fartøjsmester') setActiveTab('lager')
    } else {
      setLoginError('Forkert PIN-kode (prøv 0000)')
    }
  }

  const handleLogout = () => {
    if (hasUnsavedChanges || Object.keys(forbrug).length > 0 || Object.keys(godkendelser).length > 0) {
      if(!window.confirm('Du har ikke-gemte ændringer. Vil du stadig logge ud?')) return;
    }
    setRole(null)
    setLoginStep('role')
    setSelectedRole(null)
    setPin('')
    setForbrug({})
    setGodkendelser({})
    setItems(JSON.parse(JSON.stringify(originalItems))) 
  }

  // --- Handlers for general edits ---
  const handleCountChange = (id: number, type: 'skib' | 'container' | 'bestilt', delta: number) => {
    setItems(prevItems => prevItems.map(item => {
        if (item.id === id) {
          if (type === 'skib') return { ...item, antal_skib: Math.max(0, item.antal_skib + delta) }
          if (type === 'container') return { ...item, antal_container: Math.max(0, item.antal_container + delta) }
          if (type === 'bestilt') return { ...item, bestilt: Math.max(0, item.bestilt + delta) }
        }
        return item
      })
    )
  }

  const handleDirectInput = (id: number, type: 'skib' | 'container' | 'bestilt', newValue: number) => {
    const validValue = Math.max(0, newValue);
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        if (type === 'skib') return { ...item, antal_skib: validValue }
        if (type === 'container') return { ...item, antal_container: validValue }
        if (type === 'bestilt') return { ...item, bestilt: validValue }
      }
      return item
    }))
  }

  // --- Handlers for Skib (Forbrug) ---
  const handleForbrugChange = (id: number, delta: number) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    setForbrug(prev => {
      const current = prev[id] || 0
      const next = Math.max(0, Math.min(item.antal_skib, current + delta))
      if (next === 0) { const copy = { ...prev }; delete copy[id]; return copy }
      return { ...prev, [id]: next }
    })
  }

  const handleForbrugInput = (id: number, val: number) => {
    const item = items.find(i => i.id === id);
    if(!item) return;
    const validVal = Math.max(0, Math.min(item.antal_skib, val));
    setForbrug(prev => {
       if (validVal === 0) { const c = {...prev}; delete c[id]; return c; }
       return {...prev, [id]: validVal}
    })
  }

  const handleSaveForbrug = async () => {
    if (Object.keys(forbrug).length === 0) return alert("Ingen forbrug at gemme!")
    setSaving(true)
    let hasError = false
    const updatedItems: Item[] = []
    
    // Brug Promise.all til at optimere performance (Undgå vandfald af kald)
    const updatePromises = Object.entries(forbrug).map(async ([idStr, brugt]) => {
      const id = parseInt(idStr)
      const item = items.find(i => i.id === id)
      if (!item) return null

      const newSkib = item.antal_skib - brugt
      const { error } = await supabase.from('items').update({ antal_skib: newSkib }).eq('nr', item.nr)

      if (error) {
          hasError = true
          return null;
      }
      return { ...item, antal_skib: newSkib }
    })

    const results = await Promise.all(updatePromises);
    results.forEach(res => {
        if(res) updatedItems.push(res);
    })

    if (hasError) {
      alert("Fejl ved lagring af forbrug. Se evt. konsol.")
    } else {
      const newItems = items.map(p => {
         const u = updatedItems.find(ui => ui.id === p.id)
         return u ? u : p
      })
      setItems(newItems)
      setOriginalItems(JSON.parse(JSON.stringify(newItems)))
      setForbrug({})
      alert("Forbrug er gemt og synkroniseret!")
    }
    setSaving(false)
  }

  // --- Ny: Tilføj til bestillingsliste (Kurv) fra "Overblik" ---
  const handleAddToCart = (item: Item, amount: number, lenh: string) => {
    if (amount <= 0) return;
    setCustomOrderAmounts(prev => ({ ...prev, [item.id]: amount }));
    setOrderSelected(prev => ({ ...prev, [item.id]: true }));
    setOrderInputActive(prev => { const c={...prev}; delete c[item.id]; return c; });
    alert(`${amount} ${lenh} af ${item.objektkorttekst} er tilføjet til bestillingslisten!\n\nGå til fanen 'Bestilling' for at danne blanket og gennemføre bestillingen.`);
  }

  // --- Handlers for Fartøjsmester (Lager Gem) ---
  const handleSaveChangesLager = async () => {
    setSaving(true)
    let hasError = false
    const itemsToUpdate: Item[] = []

    for (const item of items) {
      const original = originalItems.find(o => o.id === item.id)
      const isChanged = original && (
        original.antal_skib !== item.antal_skib ||
        original.antal_container !== item.antal_container ||
        original.bestilt !== item.bestilt
      )
      if (isChanged) itemsToUpdate.push(item)
    }

    if (itemsToUpdate.length === 0) {
      setSaving(false); return;
    }

    // Parallelisér updates
    const updatePromises = itemsToUpdate.map(item => 
        supabase.from('items').update({
            antal_skib: item.antal_skib, antal_container: item.antal_container, antal_bestilt: item.bestilt 
        }).eq('nr', item.nr)
    );

    const results = await Promise.all(updatePromises);
    hasError = results.some(res => res.error);

    if (hasError) {
      alert("Der opstod en fejl ved gem. Tjek konsollen.")
    } else {
      const finalItems = items.map(p => {
         const u = itemsToUpdate.find(ui => ui.id === p.id)
         return u ? u : p
      })
      setItems(finalItems)
      setOriginalItems(JSON.parse(JSON.stringify(finalItems)))
      alert(`Flot! ${itemsToUpdate.length} vare(r) blev opdateret og synkroniseret.`)
    }
    setSaving(false)
  }

  // --- Handlers for Plukliste (Flyttes til skib) ---
  const handleMoveToShip = async (item: Item, amount: number) => {
    setSaving(true)
    const newSkib = item.antal_skib + amount
    const newCont = item.antal_container - amount
    const { error } = await supabase.from('items').update({
        antal_skib: newSkib, antal_container: newCont
    }).eq('nr', item.nr)

    if (!error) {
        setItems(prev => prev.map(p => p.id === item.id ? { ...p, antal_skib: newSkib, antal_container: newCont } : p))
        setOriginalItems(prev => prev.map(p => p.id === item.id ? { ...p, antal_skib: newSkib, antal_container: newCont } : p))
    } else {
        alert("Fejl ved flytning")
    }
    setSaving(false)
  }

  const handleMoveAllToShip = async (movingItems: Item[]) => {
    if(!window.confirm(`Er du sikker på at du vil flytte alle ${movingItems.length} varer til skibet?`)) return;
    setSaving(true)
    let hasError = false
    const updated: any[] = []
    
    const updatePromises = movingItems.map(async (item) => {
        const deficit = item.maengde - item.antal_skib
        const amount = Math.min(deficit, item.antal_container)
        if (amount > 0) {
            const newSkib = item.antal_skib + amount
            const newCont = item.antal_container - amount
            const { error } = await supabase.from('items').update({ antal_skib: newSkib, antal_container: newCont }).eq('nr', item.nr)
            if(error) {
                hasError = true;
                return null;
            }
            return { id: item.id, newSkib, newCont }
        }
        return null;
    })

    const results = await Promise.all(updatePromises);
    results.forEach(res => {
        if(res) updated.push(res);
    })

    if(!hasError) {
        setItems(prev => prev.map(p => {
            const u = updated.find(ui => ui.id === p.id)
            return u ? { ...p, antal_skib: u.newSkib, antal_container: u.newCont } : p
        }))
        setOriginalItems(prev => prev.map(p => {
            const u = updated.find(ui => ui.id === p.id)
            return u ? { ...p, antal_skib: u.newSkib, antal_container: u.newCont } : p
        }))
        alert("Alt er flyttet til skibets lager!")
    } else {
        alert("Fejl under flytning af nogle varer.")
    }
    setSaving(false)
  }

  // --- Handlers for Modtagelse ---
  const handleGodkendAlleModtagelser = async (destination: 'skib' | 'container', pendingList: Item[]) => {
    if (!window.confirm(`Er du sikker på, at du vil modtage ALLE ${pendingList.length} bestillinger og lægge dem på ${destination === 'skib' ? 'Skib' : 'Container'}?`)) return;

    setSaving(true)
    let hasError = false
    const updatedItems: any[] = []

    const updatePromises = pendingList.map(async (item) => {
      if (item.bestilt <= 0) return null;

      const newBestilt = 0; // Vi modtager alle
      const newSkib = destination === 'skib' ? item.antal_skib + item.bestilt : item.antal_skib;
      const newContainer = destination === 'container' ? item.antal_container + item.bestilt : item.antal_container;

      const { error } = await supabase.from('items').update({
        antal_bestilt: newBestilt, 
        antal_skib: newSkib, 
        antal_container: newContainer
      }).eq('nr', item.nr)

      if (error) {
        hasError = true
        console.error(error)
        return null;
      } 
      return { id: item.id, newBestilt, newSkib, newContainer }
    })

    const results = await Promise.all(updatePromises);
    results.forEach(res => { if(res) updatedItems.push(res) });

    if (hasError) {
      alert("Der opstod en fejl ved modtagelse af nogle varer. Tjek evt. konsol.")
    } else {
      alert("Alle bestillinger er nu modtaget og gemt i systemet!")
      const finalItems = items.map(p => {
        const u = updatedItems.find(ui => ui.id === p.id)
        return u ? { ...p, bestilt: u.newBestilt, antal_skib: u.newSkib, antal_container: u.newContainer } : p
      })
      setItems(finalItems)
      setOriginalItems(JSON.parse(JSON.stringify(finalItems)))
      setGodkendelser({})
    }
    setSaving(false)
  }

  const handleGodkendModtagelse = async (id: number) => {
    const godkendelse = godkendelser[id]
    if (!godkendelse || godkendelse.amount <= 0) return

    const item = items.find(i => i.id === id)
    if (!item) return

    setSaving(true)
    const newBestilt = Math.max(0, item.bestilt - godkendelse.amount)
    const newSkib = godkendelse.destination === 'skib' ? item.antal_skib + godkendelse.amount : item.antal_skib
    const newContainer = godkendelse.destination === 'container' ? item.antal_container + godkendelse.amount : item.antal_container

    const { error } = await supabase.from('items').update({
      antal_bestilt: newBestilt, antal_skib: newSkib, antal_container: newContainer
    }).eq('nr', item.nr)

    if (error) {
      alert("Fejl ved godkendelse af modtagelse.")
    } else {
      const finalItems = items.map(p => p.id === id ? { ...p, bestilt: newBestilt, antal_skib: newSkib, antal_container: newContainer } : p)
      setItems(finalItems)
      setOriginalItems(JSON.parse(JSON.stringify(finalItems)))
      setGodkendelser(prev => { const copy = { ...prev }; delete copy[id]; return copy; })
    }
    setSaving(false)
  }

  // --- Handlers for Bestillingsliste ---
    const handleGennemfoerBestilling = async (itemsToOrder: (Item & { amountToOrder: number })[]) => {
    if (itemsToOrder.length === 0) return alert("Vælg mindst én vare at bestille.");

    const defaultOptions = {
      prioritet: 'Rutine',
      dato: new Date().toISOString().split('T')[0],
      fra: 'MHV 909',
      til: 'FSC / FMI',
      emneRekvirering: true,
      emneIntern: false,
      emneLevering: false,
      emneTilbagelevering: false,
      emneOverfoersel: false,
      emneLaan: false,
      indkoebRammeaftale: false,
      indkoebCivil: false,
      indkoebSaerlig: false,
      indkoebBeredskab: false,
      bemaerkninger: 'Optælling / Mangelliste'
    };

    // Generate PDF First
    generateForsyningsblanket(defaultOptions, itemsToOrder)
    if (!window.confirm(`Er du sikker på, at du vil markere de ${itemsToOrder.length} valgte linjer som bestilt i systemet nu hvor blanketten er dannet?`)) return
    setSaving(true)
    let hasError = false
    const updatedItems: any[] = []

    const updatePromises = itemsToOrder.map(async (item) => {
      if (item.amountToOrder > 0) {
        const newBestilt = item.bestilt + item.amountToOrder
        const { error } = await supabase.from('items').update({ antal_bestilt: newBestilt }).eq('nr', item.nr)
        
        if (error) {
            hasError = true;
            return null;
        }
        return { id: item.id, newBestilt }
      }
      return null;
    })
    
    const results = await Promise.all(updatePromises);
    results.forEach(res => { if(res) updatedItems.push(res); })

    if (hasError) {
      alert("Fejl under bestilling!")
    } else {
      setItems(prev => prev.map(p => {
        const u = updatedItems.find(ui => ui.id === p.id)
        return u ? { ...p, bestilt: u.newBestilt } : p
      }))
      setOriginalItems(prev => prev.map(p => {
        const u = updatedItems.find(ui => ui.id === p.id)
        return u ? { ...p, bestilt: u.newBestilt } : p
      }))

      // Fjern fra kurv
      setCustomOrderAmounts((prev: Record<number, number>) => {
        const c = { ...prev };
        itemsToOrder.forEach(i => delete c[i.id]);
        return c;
      });
      setOrderSelected((prev: Record<number, boolean>) => {
        const c = { ...prev };
        itemsToOrder.forEach(i => delete c[i.id]);
        return c;
      });

      alert("Valgte varer er nu markeret som bestilt i systemet og flyttet til 'Afventer Levering'.")
    }
    setSaving(false)
  }

  // --- Grouping Logic ---
  const toggleSet = (id: number) => {
    setExpandedSets(prev => prev.includes(id) ? prev.filter(setId => setId !== id) : [...prev, id])
  }

  const allGroupedItems: GroupedItem[] = []
  let currentGroup: GroupedItem | null = null
  items.forEach(item => {
    const isSet = item.komponentnummer.length > 15
    if (isSet) {
      currentGroup = { parent: item, children: [] }
      allGroupedItems.push(currentGroup)
    } else {
      if (currentGroup) {
        currentGroup.children.push(item)
      } else {
        allGroupedItems.push({ parent: item, children: [] })
      }
    }
  })

  const groupedItems = allGroupedItems.map(group => {
    const parentMatches = group.parent.objektkorttekst.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          group.parent.komponentnummer.includes(searchTerm)
    const matchingChildren = group.children.filter(child => 
      child.objektkorttekst.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.komponentnummer.includes(searchTerm)
    )

    if (parentMatches || matchingChildren.length > 0) {
      return {
        parent: group.parent,
        children: parentMatches ? group.children : matchingChildren
      }
    }
    return null
  }).filter(Boolean) as GroupedItem[]

  // --- LOGIN SKÆRM ---
  if (!role) {
    return (
      <LoginScreen 
        loginStep={loginStep}
        selectedRole={selectedRole}
        pin={pin}
        loginError={loginError}
        setLoginStep={setLoginStep}
        setSelectedRole={setSelectedRole}
        setPin={setPin}
        setLoginError={setLoginError}
        handleLogin={handleLogin}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-6 lg:p-8 font-sans pb-32">
      <div className="max-w-[1400px] mx-auto">
        
        {/* APP HEADER */}
        <header className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl lg:rounded-xl shadow-xl mb-6 sticky top-2 z-50 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-blue-600">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-lg hidden sm:block shadow-inner">
                {role === 'skib' ? <ShipIcon /> : <HelmIcon />}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-wide flex items-center gap-2">
                  MHV 909 <span className="text-blue-400 font-medium">| {role === 'skib' ? 'Skib' : 'Fartøjsmester'}</span>
                </h1>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Lagerstyring</p>
              </div>
            </div>
            <button onClick={handleLogout} className="md:hidden p-3 bg-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"><LogoutIcon /></button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {role === 'skib' && (
              <div className="flex bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                <button onClick={() => setActiveTab('forbrug')} className={`flex-1 px-5 py-2.5 rounded-md font-bold text-sm transition-all ${activeTab === 'forbrug' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Forbrug</button>
                <button onClick={() => setActiveTab('optaelling_skib')} className={`flex-1 px-5 py-2.5 rounded-md font-bold text-sm transition-all ${activeTab === 'optaelling_skib' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Optælling</button>
              </div>
            )}

            {role === 'fartøjsmester' && (
              <div className="flex overflow-x-auto max-w-full md:flex-wrap bg-slate-800 p-1.5 rounded-lg border border-slate-700 gap-1 no-scrollbar whitespace-nowrap">
                <button onClick={() => setActiveTab('lager')} className={`flex-1 min-w-[100px] md:min-w-0 px-4 py-2.5 rounded-md font-bold text-sm transition-all ${activeTab === 'lager' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Overblik</button>
                <button onClick={() => setActiveTab('optaelling_mester')} className={`flex-1 min-w-[100px] md:min-w-0 px-4 py-2.5 rounded-md font-bold text-sm transition-all ${activeTab === 'optaelling_mester' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Optælling</button>
                <button onClick={() => setActiveTab('bestilling')} className={`flex-1 min-w-[100px] md:min-w-0 px-4 py-2.5 rounded-md font-bold text-sm transition-all ${activeTab === 'bestilling' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Bestilling</button>
                <button onClick={() => setActiveTab('afventer')} className={`flex-1 min-w-[140px] md:min-w-0 px-4 py-2.5 rounded-md font-bold text-sm transition-all ${activeTab === 'afventer' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Afventer Levering</button>
                <button onClick={() => setActiveTab('plukliste')} className={`flex-1 min-w-[100px] md:min-w-0 px-4 py-2.5 rounded-md font-bold text-sm transition-all ${activeTab === 'plukliste' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Plukliste</button>
                <button onClick={() => setActiveTab('kassation')} className={`flex-1 min-w-[100px] md:min-w-0 px-4 py-2.5 rounded-md font-bold text-sm transition-all ${activeTab === 'kassation' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Kassation</button>
              </div>
            )}
            <button onClick={handleLogout} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors font-bold text-sm border border-slate-700 shadow-sm"><LogoutIcon /> Log ud</button>
          </div>
        </header>

        {loading ? (
          <div className="text-center p-16 text-slate-500 text-xl font-bold animate-pulse">Henter data fra databasen...</div>
        ) : (
          <>
            {/* SØGEFELT */}
            {(activeTab !== 'bestilling' && activeTab !== 'afventer' && activeTab !== 'plukliste') && (
              <div className="mb-6">
                <input type="text" placeholder="Søg på varenr eller komponentnavn..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-4 md:p-5 rounded-xl border-2 border-slate-200 bg-white text-slate-800 shadow-sm focus:outline-none focus:border-blue-500 text-lg transition-colors" />
              </div>
            )}

            {/* TAB VIEWS */}
            {activeTab === 'forbrug' && (
              <ForbrugTab 
                groupedItems={groupedItems} expandedSets={expandedSets} forbrug={forbrug} saving={saving}
                handleSaveForbrug={handleSaveForbrug} toggleSet={toggleSet} handleForbrugChange={handleForbrugChange} handleForbrugInput={handleForbrugInput} 
              />
            )}

            {activeTab === 'optaelling_skib' && (
              <OptaellingSkibTab 
                groupedItems={groupedItems} expandedSets={expandedSets} saving={saving} hasUnsavedChanges={hasUnsavedChanges}
                handleSaveChangesLager={handleSaveChangesLager} toggleSet={toggleSet} handleCountChange={handleCountChange} handleDirectInput={handleDirectInput} 
              />
            )}

                        {activeTab === 'lager' && (
              <LagerOverblikTab 
                groupedItems={groupedItems} expandedSets={expandedSets} orderInputActive={orderInputActive}
                generatePDF={(type) => generateLagerlistePDF(type, items)} toggleSet={toggleSet} setOrderInputActive={setOrderInputActive} handleAddToCart={handleAddToCart}
              />
            )}

            {activeTab === 'optaelling_mester' && (
              <OptaellingMesterTab 
                groupedItems={groupedItems} expandedSets={expandedSets} saving={saving} hasUnsavedChanges={hasUnsavedChanges} originalItems={originalItems}
                handleSaveChangesLager={handleSaveChangesLager} toggleSet={toggleSet} handleCountChange={handleCountChange} handleDirectInput={handleDirectInput}
              />
            )}

            {activeTab === 'bestilling' && (
              <BestillingskurvTab 
                items={items} customOrderAmounts={customOrderAmounts} orderSelected={orderSelected}
                setCustomOrderAmounts={setCustomOrderAmounts} setOrderSelected={setOrderSelected} handleGennemfoerBestilling={handleGennemfoerBestilling}
              />
            )}

            {activeTab === 'afventer' && (
              <AfventerLeveringTab 
                items={items} saving={saving} godkendelser={godkendelser}
                setGodkendelser={setGodkendelser} handleGodkendAlleModtagelser={handleGodkendAlleModtagelser} handleGodkendModtagelse={handleGodkendModtagelse}
              />
            )}

                        {activeTab === 'plukliste' && (
              <PluklisteTab 
                items={items} saving={saving} handleMoveAllToShip={handleMoveAllToShip} handleMoveToShip={handleMoveToShip}
              />
            )}

            {activeTab === 'kassation' && (
              <KassationTab items={items} />
            )}

          </>
        )}
      </div>
    </div>
  )
}
