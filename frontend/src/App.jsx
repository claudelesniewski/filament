import { useState, useEffect } from 'react'
import * as api from './api'
import Papa from 'papaparse'

function App() {
  const [activeTab, setActiveTab] = useState('inventory')

  return (
    <div className="app">
      <header className="header">
        <h1>🧵 Filament Inventory Tracker</h1>
        <p>Track your 3D printing filament purchases, inventory, and usage</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory Summary
        </button>
        <button
          className={`tab ${activeTab === 'filaments' ? 'active' : ''}`}
          onClick={() => setActiveTab('filaments')}
        >
          Filaments
        </button>
        <button
          className={`tab ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          Purchases
        </button>
        <button
          className={`tab ${activeTab === 'spools' ? 'active' : ''}`}
          onClick={() => setActiveTab('spools')}
        >
          Spools
        </button>
        <button
          className={`tab ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          Vendors
        </button>
      </div>

      <div className="content">
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'filaments' && <FilamentsTab />}
        {activeTab === 'purchases' && <PurchasesTab />}
        {activeTab === 'spools' && <SpoolsTab />}
        {activeTab === 'vendors' && <VendorsTab />}
      </div>
    </div>
  )
}

// Inventory Summary Tab
function InventoryTab() {
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      const response = await api.getInventorySummary()
      setSummary(response.data)
    } catch (error) {
      console.error('Error loading summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading inventory...</div>

  const totalPurchased = summary.reduce((sum, item) => sum + item.total_purchased_kg, 0)
  const totalRemaining = summary.reduce((sum, item) => sum + item.total_remaining_kg, 0)
  const totalSpools = summary.reduce((sum, item) => sum + item.unopened_spools + item.opened_spools, 0)

  return (
    <div>
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Purchased</h3>
          <p className="value">{totalPurchased.toFixed(2)} kg</p>
        </div>
        <div className="summary-card">
          <h3>Total Remaining</h3>
          <p className="value">{totalRemaining.toFixed(2)} kg</p>
        </div>
        <div className="summary-card">
          <h3>Active Spools</h3>
          <p className="value">{totalSpools}</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Filament</th>
              <th>Manufacturer</th>
              <th>Material</th>
              <th>Color</th>
              <th>Purchased (kg)</th>
              <th>Remaining (kg)</th>
              <th>Unopened</th>
              <th>Opened</th>
              <th>Finished</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, idx) => (
              <tr key={idx}>
                <td>{item.filament_name}</td>
                <td>{item.manufacturer}</td>
                <td>{item.material}</td>
                <td>{item.color}</td>
                <td>{item.total_purchased_kg.toFixed(2)}</td>
                <td>{item.total_remaining_kg.toFixed(2)}</td>
                <td>{item.unopened_spools}</td>
                <td>{item.opened_spools}</td>
                <td>{item.finished_spools}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Vendors Tab with inline editing
function VendorsTab() {
  const [vendors, setVendors] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ name: '', notes: '' })

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      const response = await api.getVendors()
      setVendors(response.data)
    } catch (error) {
      console.error('Error loading vendors:', error)
    }
  }

  const handleEdit = (vendor) => {
    setEditingId(vendor.id)
    setFormData({ name: vendor.name, notes: vendor.notes })
  }

  const handleSave = async (id) => {
    try {
      if (id === 'new') {
        await api.createVendor(formData)
        setIsAdding(false)
      } else {
        await api.updateVendor(id, formData)
        setEditingId(null)
      }
      setFormData({ name: '', notes: '' })
      loadVendors()
    } catch (error) {
      alert('Error saving vendor: ' + error.response?.data?.detail)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({ name: '', notes: '' })
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        await api.deleteVendor(id)
        loadVendors()
      } catch (error) {
        alert('Error deleting vendor: ' + error.response?.data?.detail)
      }
    }
  }

  const handleImportCSV = (event) => {
    const file = event.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let imported = 0
        let failed = 0

        for (const row of results.data) {
          try {
            const vendorData = {
              name: row['Name'] || row['Vendor'] || '',
              notes: row['Notes'] || ''
            }

            if (vendorData.name) {
              await api.createVendor(vendorData)
              imported++
            }
          } catch (error) {
            console.error('Error importing row:', row, error)
            failed++
          }
        }

        alert(`Import complete!\nImported: ${imported}\nFailed: ${failed}`)
        loadVendors()
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message)
      }
    })

    // Reset input
    event.target.value = ''
  }

  return (
    <div>
      <div className="toolbar">
        <h2>Vendors</h2>
        <div style={{display: 'flex', gap: '10px'}}>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            style={{display: 'none'}}
            id="vendor-csv-input"
          />
          <label htmlFor="vendor-csv-input" className="btn btn-secondary">
            Import CSV
          </label>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)} disabled={isAdding || editingId}>
            + Add Vendor
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(vendor => (
              <tr key={vendor.id} className={editingId === vendor.id ? 'editing-row' : ''}>
                <td>
                  {editingId === vendor.id ? (
                    <input
                      className="inline-input"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      autoFocus
                    />
                  ) : (
                    <strong>{vendor.name}</strong>
                  )}
                </td>
                <td>
                  {editingId === vendor.id ? (
                    <input
                      className="inline-input"
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  ) : (
                    vendor.notes
                  )}
                </td>
                <td className="actions">
                  {editingId === vendor.id ? (
                    <>
                      <button className="btn btn-small btn-primary" onClick={() => handleSave(vendor.id)}>Save</button>
                      <button className="btn btn-small btn-secondary" onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-small btn-secondary" onClick={() => handleEdit(vendor)} disabled={isAdding || editingId}>Edit</button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(vendor.id)} disabled={isAdding || editingId}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {isAdding && (
              <tr className="editing-row new-row">
                <td>
                  <input
                    className="inline-input"
                    placeholder="Vendor name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    autoFocus
                  />
                </td>
                <td>
                  <input
                    className="inline-input"
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </td>
                <td className="actions">
                  <button className="btn btn-small btn-primary" onClick={() => handleSave('new')}>Save</button>
                  <button className="btn btn-small btn-secondary" onClick={handleCancel}>Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Filaments Tab with inline editing
function FilamentsTab() {
  const [filaments, setFilaments] = useState([])
  const [vendors, setVendors] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    line: '',
    material: 'PLA',
    product: '',
    color: '',
    feature: '',
    date_added: new Date().toISOString().split('T')[0],
    url: '',
    notes: ''
  })

  useEffect(() => {
    loadFilaments()
    loadVendors()
  }, [])

  const loadFilaments = async () => {
    try {
      const response = await api.getFilaments()
      setFilaments(response.data)
    } catch (error) {
      console.error('Error loading filaments:', error)
    }
  }

  const loadVendors = async () => {
    try {
      const response = await api.getVendors()
      setVendors(response.data)
    } catch (error) {
      console.error('Error loading vendors:', error)
    }
  }

  const handleEdit = (filament) => {
    setEditingId(filament.id)
    setFormData(filament)
  }

  const handleSave = async (id) => {
    try {
      if (id === 'new') {
        await api.createFilament(formData)
        setIsAdding(false)
      } else {
        await api.updateFilament(id, formData)
        setEditingId(null)
      }
      resetForm()
      loadFilaments()
    } catch (error) {
      alert('Error saving filament: ' + error.response?.data?.detail)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      manufacturer: '',
      line: '',
      material: 'PLA',
      product: '',
      color: '',
      feature: '',
      date_added: new Date().toISOString().split('T')[0],
      url: '',
      notes: ''
    })
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this filament?')) {
      try {
        await api.deleteFilament(id)
        loadFilaments()
      } catch (error) {
        alert('Error deleting filament: ' + error.response?.data?.detail)
      }
    }
  }

  const handleImportCSV = (event) => {
    const file = event.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let imported = 0
        let failed = 0

        for (const row of results.data) {
          try {
            // Map CSV headers to database fields (case-insensitive)
            const filamentData = {
              name: row['Filament name'] || row['Name'] || '',
              manufacturer: row['Manufacturer'] || '',
              line: row['Line'] || '',
              material: row['Material'] || 'PLA',
              product: row['Product'] || '',
              color: row['Color'] || '',
              feature: row['Feature'] || '',
              date_added: row['Date added'] || new Date().toISOString().split('T')[0],
              url: row['URL'] || '',
              notes: row['Notes'] || ''
            }

            if (filamentData.name) {
              await api.createFilament(filamentData)
              imported++
            }
          } catch (error) {
            console.error('Error importing row:', row, error)
            failed++
          }
        }

        alert(`Import complete!\nImported: ${imported}\nFailed: ${failed}`)
        loadFilaments()
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message)
      }
    })

    // Reset input
    event.target.value = ''
  }

  return (
    <div>
      <div className="toolbar">
        <h2>Filaments</h2>
        <div style={{display: 'flex', gap: '10px'}}>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            style={{display: 'none'}}
            id="filament-csv-input"
          />
          <label htmlFor="filament-csv-input" className="btn btn-secondary">
            Import CSV
          </label>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)} disabled={isAdding || editingId}>
            + Add Filament
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Manufacturer</th>
              <th>Line</th>
              <th>Product</th>
              <th>Material</th>
              <th>Color</th>
              <th>Feature</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filaments.map(filament => (
              <tr key={filament.id} className={editingId === filament.id ? 'editing-row' : ''}>
                <td>
                  {editingId === filament.id ? (
                    <input
                      className="inline-input"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      autoFocus
                    />
                  ) : (
                    <strong>{filament.name}</strong>
                  )}
                </td>
                <td>
                  {editingId === filament.id ? (
                    <select
                      className="inline-input"
                      value={formData.manufacturer}
                      onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                    >
                      <option value="">Select...</option>
                      {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                    </select>
                  ) : (
                    filament.manufacturer
                  )}
                </td>
                <td>
                  {editingId === filament.id ? (
                    <input
                      className="inline-input"
                      value={formData.line}
                      onChange={e => setFormData({...formData, line: e.target.value})}
                    />
                  ) : (
                    filament.line
                  )}
                </td>
                <td>
                  {editingId === filament.id ? (
                    <input
                      className="inline-input"
                      value={formData.product}
                      onChange={e => setFormData({...formData, product: e.target.value})}
                    />
                  ) : (
                    filament.product
                  )}
                </td>
                <td>
                  {editingId === filament.id ? (
                    <select
                      className="inline-input"
                      value={formData.material}
                      onChange={e => setFormData({...formData, material: e.target.value})}
                    >
                      <option value="PLA">PLA</option>
                      <option value="PETG">PETG</option>
                      <option value="ABS">ABS</option>
                      <option value="TPU">TPU</option>
                      <option value="Nylon">Nylon</option>
                      <option value="ASA">ASA</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span className="badge badge-info">{filament.material}</span>
                  )}
                </td>
                <td>
                  {editingId === filament.id ? (
                    <input
                      className="inline-input"
                      value={formData.color}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                    />
                  ) : (
                    filament.color
                  )}
                </td>
                <td>
                  {editingId === filament.id ? (
                    <input
                      className="inline-input"
                      value={formData.feature}
                      onChange={e => setFormData({...formData, feature: e.target.value})}
                    />
                  ) : (
                    filament.feature
                  )}
                </td>
                <td>
                  {editingId === filament.id ? (
                    <input
                      type="date"
                      className="inline-input"
                      value={formData.date_added}
                      onChange={e => setFormData({...formData, date_added: e.target.value})}
                    />
                  ) : (
                    filament.date_added
                  )}
                </td>
                <td className="actions">
                  {editingId === filament.id ? (
                    <>
                      <button className="btn btn-small btn-primary" onClick={() => handleSave(filament.id)}>Save</button>
                      <button className="btn btn-small btn-secondary" onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-small btn-secondary" onClick={() => handleEdit(filament)} disabled={isAdding || editingId}>Edit</button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(filament.id)} disabled={isAdding || editingId}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {isAdding && (
              <tr className="editing-row new-row">
                <td>
                  <input
                    className="inline-input"
                    placeholder="Filament name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    autoFocus
                  />
                </td>
                <td>
                  <select
                    className="inline-input"
                    value={formData.manufacturer}
                    onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                  >
                    <option value="">Select...</option>
                    {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                  </select>
                </td>
                <td>
                  <input
                    className="inline-input"
                    placeholder="Line"
                    value={formData.line}
                    onChange={e => setFormData({...formData, line: e.target.value})}
                  />
                </td>
                <td>
                  <input
                    className="inline-input"
                    placeholder="Product"
                    value={formData.product}
                    onChange={e => setFormData({...formData, product: e.target.value})}
                  />
                </td>
                <td>
                  <select
                    className="inline-input"
                    value={formData.material}
                    onChange={e => setFormData({...formData, material: e.target.value})}
                  >
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="ABS">ABS</option>
                    <option value="TPU">TPU</option>
                    <option value="Nylon">Nylon</option>
                    <option value="ASA">ASA</option>
                    <option value="Other">Other</option>
                  </select>
                </td>
                <td>
                  <input
                    className="inline-input"
                    placeholder="Color"
                    value={formData.color}
                    onChange={e => setFormData({...formData, color: e.target.value})}
                  />
                </td>
                <td>
                  <input
                    className="inline-input"
                    placeholder="Feature"
                    value={formData.feature}
                    onChange={e => setFormData({...formData, feature: e.target.value})}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    className="inline-input"
                    value={formData.date_added}
                    onChange={e => setFormData({...formData, date_added: e.target.value})}
                  />
                </td>
                <td className="actions">
                  <button className="btn btn-small btn-primary" onClick={() => handleSave('new')}>Save</button>
                  <button className="btn btn-small btn-secondary" onClick={handleCancel}>Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Purchases Tab with inline editing (complex nested structure)
function PurchasesTab() {
  const [purchases, setPurchases] = useState([])
  const [filaments, setFilaments] = useState([])
  const [vendors, setVendors] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [formData, setFormData] = useState({
    date_ordered: new Date().toISOString().split('T')[0],
    marketplace: '',
    order_url: '',
    subtotal: 0,
    tax: 0,
    notes: '',
    items: [{
      filament_name: '',
      seller: '',
      date_ordered: new Date().toISOString().split('T')[0],
      date_received: '',
      spools: 1,
      kg_per_spool: 1.0,
      unit_price: 0,
      shelf: '',
      notes: ''
    }]
  })
  const [showNewFilament, setShowNewFilament] = useState({})
  const [newFilamentData, setNewFilamentData] = useState({})

  useEffect(() => {
    loadPurchases()
    loadFilaments()
    loadVendors()
  }, [])

  const loadPurchases = async () => {
    try {
      const response = await api.getPurchases()
      setPurchases(response.data)
    } catch (error) {
      console.error('Error loading purchases:', error)
    }
  }

  const loadFilaments = async () => {
    try {
      const response = await api.getFilaments()
      setFilaments(response.data)
    } catch (error) {
      console.error('Error loading filaments:', error)
    }
  }

  const loadVendors = async () => {
    try {
      const response = await api.getVendors()
      setVendors(response.data)
    } catch (error) {
      console.error('Error loading vendors:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this purchase?')) {
      try {
        await api.deletePurchase(id)
        loadPurchases()
      } catch (error) {
        alert('Error deleting purchase: ' + error.response?.data?.detail)
      }
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        filament_name: '',
        seller: '',
        date_ordered: formData.date_ordered,
        date_received: '',
        spools: 1,
        kg_per_spool: 1.0,
        unit_price: 0,
        shelf: '',
        notes: ''
      }]
    })
  }

  const updateItem = (idx, field, value) => {
    const newItems = [...formData.items]
    newItems[idx][field] = value
    setFormData({...formData, items: newItems})
  }

  const removeItem = (idx) => {
    if (formData.items.length > 1) {
      setFormData({...formData, items: formData.items.filter((_, i) => i !== idx)})
    }
  }

  const handleCreateNewFilament = async (idx) => {
    const data = newFilamentData[idx]
    if (!data || !data.name || !data.manufacturer || !data.material) {
      alert('Please fill in Name, Manufacturer, and Material for the new filament')
      return
    }

    try {
      const filamentData = {
        name: data.name,
        manufacturer: data.manufacturer,
        material: data.material,
        color: data.color || '',
        feature: data.feature || '',
        line: data.line || '',
        product: data.product || '',
        date_added: new Date().toISOString().split('T')[0],
        url: '',
        notes: ''
      }
      await api.createFilament(filamentData)
      updateItem(idx, 'filament_name', data.name)
      setShowNewFilament({...showNewFilament, [idx]: false})
      setNewFilamentData({...newFilamentData, [idx]: {}})
      await loadFilaments()
    } catch (error) {
      alert('Error creating filament: ' + error.response?.data?.detail)
    }
  }

  const handleSave = async () => {
    try {
      await api.createPurchase(formData)
      setIsAdding(false)
      resetForm()
      loadPurchases()
    } catch (error) {
      alert('Error saving purchase: ' + error.response?.data?.detail)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setExpandedId(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      date_ordered: new Date().toISOString().split('T')[0],
      marketplace: '',
      order_url: '',
      subtotal: 0,
      tax: 0,
      notes: '',
      items: [{
        filament_name: '',
        seller: '',
        date_ordered: new Date().toISOString().split('T')[0],
        date_received: '',
        spools: 1,
        kg_per_spool: 1.0,
        unit_price: 0,
        shelf: '',
        notes: ''
      }]
    })
    setShowNewFilament({})
    setNewFilamentData({})
  }

  const handleImportCSV = (event) => {
    const file = event.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let imported = 0
        let failed = 0

        // Group rows by Order URL to create purchases with multiple items
        const purchaseMap = new Map()

        for (const row of results.data) {
          const orderUrl = row['Order'] || ''
          const marketplace = row['Marketplace'] || ''

          if (!purchaseMap.has(orderUrl)) {
            purchaseMap.set(orderUrl, {
              date_ordered: row['Date ordered'] || new Date().toISOString().split('T')[0],
              marketplace: marketplace,
              order_url: orderUrl,
              subtotal: parseFloat(row['Order subtotal']?.replace('$', '') || '0'),
              tax: parseFloat(row['Order tax']?.replace('$', '') || '0'),
              notes: '',
              items: []
            })
          }

          const purchase = purchaseMap.get(orderUrl)
          purchase.items.push({
            filament_name: row['Filament'] || '',
            seller: row['Seller'] || marketplace,
            date_ordered: row['Date ordered'] || new Date().toISOString().split('T')[0],
            date_received: row['Date received'] || '',
            spools: parseInt(row['Spools'] || '1'),
            kg_per_spool: parseFloat(row['KG/spool'] || '1.0'),
            unit_price: parseFloat(row['Unit price']?.replace('$', '') || '0'),
            shelf: row['Shelf'] || '',
            notes: row['Notes'] || ''
          })
        }

        // Create purchases
        for (const purchase of purchaseMap.values()) {
          if (purchase.items.length > 0 && purchase.items.some(item => item.filament_name)) {
            try {
              await api.createPurchase(purchase)
              imported++
            } catch (error) {
              console.error('Error importing purchase:', purchase, error)
              failed++
            }
          }
        }

        alert(`Import complete!\nImported: ${imported} purchases\nFailed: ${failed}`)
        loadPurchases()
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message)
      }
    })

    // Reset input
    event.target.value = ''
  }

  return (
    <div>
      <div className="toolbar">
        <h2>Purchases</h2>
        <div style={{display: 'flex', gap: '10px'}}>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            style={{display: 'none'}}
            id="purchase-csv-input"
          />
          <label htmlFor="purchase-csv-input" className="btn btn-secondary">
            Import CSV
          </label>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)} disabled={isAdding}>
            + Add Purchase
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Marketplace</th>
              <th>URL</th>
              <th>Items</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(purchase => (
              <tr key={purchase.id}>
                <td>{purchase.date_ordered}</td>
                <td>{purchase.marketplace}</td>
                <td>
                  {purchase.order_url ? (
                    <a href={purchase.order_url} target="_blank" rel="noopener noreferrer" style={{color: '#667eea', textDecoration: 'none'}}>🔗</a>
                  ) : (
                    '-'
                  )}
                </td>
                <td>{purchase.items.length} item(s)</td>
                <td>${purchase.subtotal.toFixed(2)}</td>
                <td>${purchase.tax.toFixed(2)}</td>
                <td><strong>${(purchase.subtotal + purchase.tax).toFixed(2)}</strong></td>
                <td style={{fontSize: '13px', color: '#718096'}}>{purchase.notes || '-'}</td>
                <td className="actions">
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(purchase.id)} disabled={isAdding}>Delete</button>
                </td>
              </tr>
            ))}
            {isAdding && (
              <>
                <tr className="editing-row new-row">
                  <td>
                    <input
                      type="date"
                      className="inline-input"
                      value={formData.date_ordered}
                      onChange={e => setFormData({...formData, date_ordered: e.target.value})}
                      autoFocus
                    />
                  </td>
                  <td>
                    <input
                      className="inline-input"
                      placeholder="eBay, Amazon..."
                      value={formData.marketplace}
                      onChange={e => setFormData({...formData, marketplace: e.target.value})}
                    />
                  </td>
                  <td>
                    <input
                      className="inline-input"
                      placeholder="URL"
                      value={formData.order_url}
                      onChange={e => setFormData({...formData, order_url: e.target.value})}
                    />
                  </td>
                  <td>
                    <span style={{color: '#718096', fontSize: '13px'}}>{formData.items.length} item(s)</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      className="inline-input"
                      placeholder="0.00"
                      value={formData.subtotal}
                      onChange={e => setFormData({...formData, subtotal: parseFloat(e.target.value) || 0})}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      className="inline-input"
                      placeholder="0.00"
                      value={formData.tax}
                      onChange={e => setFormData({...formData, tax: parseFloat(e.target.value) || 0})}
                    />
                  </td>
                  <td><strong>${(formData.subtotal + formData.tax).toFixed(2)}</strong></td>
                  <td>
                    <input
                      className="inline-input"
                      placeholder="Notes"
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </td>
                  <td className="actions">
                    <button className="btn btn-small btn-primary" onClick={handleSave}>Save</button>
                    <button className="btn btn-small btn-secondary" onClick={handleCancel}>Cancel</button>
                  </td>
                </tr>
                <tr className="purchase-items-row">
                  <td colSpan="9">
                    <div className="purchase-items-inline">
                      <div style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <strong>Purchase Items ({formData.items.length})</strong>
                        <button type="button" className="btn btn-small btn-secondary" onClick={addItem}>+ Add Item</button>
                      </div>
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th style={{width: '20%'}}>Filament</th>
                            <th style={{width: '15%'}}>Seller</th>
                            <th style={{width: '8%'}}>Spools</th>
                            <th style={{width: '10%'}}>Kg/Spool</th>
                            <th style={{width: '10%'}}>Price</th>
                            <th style={{width: '12%'}}>Received</th>
                            <th style={{width: '10%'}}>Shelf</th>
                            <th style={{width: '80px'}}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.items.map((item, idx) => (
                            <>
                              <tr key={idx}>
                                <td>
                                  <div style={{display: 'flex', gap: '5px'}}>
                                    <select
                                      className="inline-input"
                                      required={!showNewFilament[idx]}
                                      style={{flex: 1, minWidth: 0}}
                                      value={item.filament_name}
                                      onChange={e => updateItem(idx, 'filament_name', e.target.value)}
                                      disabled={showNewFilament[idx]}
                                    >
                                      <option value="">Select...</option>
                                      {filaments.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                                    </select>
                                    <button
                                      type="button"
                                      className="btn btn-small btn-secondary"
                                      style={{whiteSpace: 'nowrap'}}
                                      onClick={() => setShowNewFilament({...showNewFilament, [idx]: !showNewFilament[idx]})}
                                    >
                                      {showNewFilament[idx] ? '✕' : '+'}
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <input
                                    className="inline-input"
                                    value={item.seller}
                                    onChange={e => updateItem(idx, 'seller', e.target.value)}
                                    placeholder="Seller"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="inline-input"
                                    value={item.spools}
                                    onChange={e => updateItem(idx, 'spools', parseInt(e.target.value) || 0)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="inline-input"
                                    value={item.kg_per_spool}
                                    onChange={e => updateItem(idx, 'kg_per_spool', parseFloat(e.target.value) || 0)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="inline-input"
                                    placeholder="0.00"
                                    value={item.unit_price}
                                    onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="date"
                                    className="inline-input"
                                    value={item.date_received}
                                    onChange={e => updateItem(idx, 'date_received', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="inline-input"
                                    value={item.shelf}
                                    onChange={e => updateItem(idx, 'shelf', e.target.value)}
                                    placeholder="A1"
                                  />
                                </td>
                                <td>
                                  {formData.items.length > 1 && (
                                    <button type="button" className="btn btn-small btn-danger" onClick={() => removeItem(idx)}>✕</button>
                                  )}
                                </td>
                              </tr>
                              {showNewFilament[idx] && (
                                <tr className="new-filament-row">
                                  <td colSpan="8">
                                    <div className="new-filament-compact">
                                      <strong style={{marginRight: '15px', fontSize: '13px'}}>New Filament:</strong>
                                      <input
                                        placeholder="Name *"
                                        style={{width: '180px'}}
                                        value={newFilamentData[idx]?.name || ''}
                                        onChange={e => setNewFilamentData({...newFilamentData, [idx]: {...(newFilamentData[idx] || {}), name: e.target.value}})}
                                      />
                                      <select
                                        style={{width: '130px'}}
                                        value={newFilamentData[idx]?.manufacturer || ''}
                                        onChange={e => setNewFilamentData({...newFilamentData, [idx]: {...(newFilamentData[idx] || {}), manufacturer: e.target.value}})}
                                      >
                                        <option value="">Manufacturer *</option>
                                        {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                                      </select>
                                      <select
                                        style={{width: '100px'}}
                                        value={newFilamentData[idx]?.material || 'PLA'}
                                        onChange={e => setNewFilamentData({...newFilamentData, [idx]: {...(newFilamentData[idx] || {}), material: e.target.value}})}
                                      >
                                        <option value="PLA">PLA</option>
                                        <option value="PETG">PETG</option>
                                        <option value="ABS">ABS</option>
                                        <option value="TPU">TPU</option>
                                        <option value="Nylon">Nylon</option>
                                        <option value="ASA">ASA</option>
                                      </select>
                                      <input
                                        placeholder="Color"
                                        style={{width: '100px'}}
                                        value={newFilamentData[idx]?.color || ''}
                                        onChange={e => setNewFilamentData({...newFilamentData, [idx]: {...(newFilamentData[idx] || {}), color: e.target.value}})}
                                      />
                                      <input
                                        placeholder="Feature"
                                        style={{width: '100px'}}
                                        value={newFilamentData[idx]?.feature || ''}
                                        onChange={e => setNewFilamentData({...newFilamentData, [idx]: {...(newFilamentData[idx] || {}), feature: e.target.value}})}
                                      />
                                      <button
                                        type="button"
                                        className="btn btn-small btn-primary"
                                        onClick={() => handleCreateNewFilament(idx)}
                                      >
                                        Create
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


// Spools Tab with inline editing
function SpoolsTab() {
  const [spools, setSpools] = useState([])
  const [filaments, setFilaments] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    filament_name: '',
    date_opened: new Date().toISOString().split('T')[0],
    date_finished: '',
    shelf: '',
    remaining_kg: 1.0,
    notes: ''
  })

  useEffect(() => {
    loadSpools()
    loadFilaments()
  }, [])

  const loadSpools = async () => {
    try {
      const response = await api.getSpools()
      setSpools(response.data)
    } catch (error) {
      console.error('Error loading spools:', error)
    }
  }

  const loadFilaments = async () => {
    try {
      const response = await api.getFilaments()
      setFilaments(response.data)
    } catch (error) {
      console.error('Error loading filaments:', error)
    }
  }

  const handleEdit = (spool) => {
    setEditingId(spool.id)
    setFormData(spool)
  }

  const handleSave = async (id) => {
    try {
      if (id === 'new') {
        await api.createSpool(formData)
        setIsAdding(false)
      } else {
        await api.updateSpool(id, formData)
        setEditingId(null)
      }
      resetForm()
      loadSpools()
    } catch (error) {
      alert('Error saving spool: ' + error.response?.data?.detail)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      filament_name: '',
      date_opened: new Date().toISOString().split('T')[0],
      date_finished: '',
      shelf: '',
      remaining_kg: 1.0,
      notes: ''
    })
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this spool?')) {
      try {
        await api.deleteSpool(id)
        loadSpools()
      } catch (error) {
        alert('Error deleting spool: ' + error.response?.data?.detail)
      }
    }
  }

  const handleImportCSV = (event) => {
    const file = event.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let imported = 0
        let failed = 0

        for (const row of results.data) {
          try {
            // Map CSV headers to database fields
            const spoolData = {
              filament_name: row['Filament'] || '',
              date_opened: row['Date opened'] || new Date().toISOString().split('T')[0],
              date_finished: row['Date finished'] || '',
              shelf: row['Shelf'] || '',
              remaining_kg: parseFloat(row['Remaining (kg)'] || row['Remaining'] || '1.0'),
              notes: row['Notes'] || ''
            }

            if (spoolData.filament_name) {
              await api.createSpool(spoolData)
              imported++
            }
          } catch (error) {
            console.error('Error importing row:', row, error)
            failed++
          }
        }

        alert(`Import complete!\nImported: ${imported}\nFailed: ${failed}`)
        loadSpools()
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message)
      }
    })

    // Reset input
    event.target.value = ''
  }

  return (
    <div>
      <div className="toolbar">
        <h2>Spools</h2>
        <div style={{display: 'flex', gap: '10px'}}>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            style={{display: 'none'}}
            id="spool-csv-input"
          />
          <label htmlFor="spool-csv-input" className="btn btn-secondary">
            Import CSV
          </label>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)} disabled={isAdding || editingId}>
            + Open New Spool
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Filament</th>
              <th>Date Opened</th>
              <th>Remaining (kg)</th>
              <th>Shelf</th>
              <th>Status</th>
              <th>Date Finished</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {spools.map(spool => (
              <tr key={spool.id} className={editingId === spool.id ? 'editing-row' : ''}>
                <td>
                  {editingId === spool.id ? (
                    <select
                      className="inline-input"
                      value={formData.filament_name}
                      onChange={e => setFormData({...formData, filament_name: e.target.value})}
                      disabled
                    >
                      <option value={spool.filament_name}>{spool.filament_name}</option>
                    </select>
                  ) : (
                    <strong>{spool.filament_name}</strong>
                  )}
                </td>
                <td>
                  {editingId === spool.id ? (
                    <input
                      type="date"
                      className="inline-input"
                      value={formData.date_opened}
                      onChange={e => setFormData({...formData, date_opened: e.target.value})}
                    />
                  ) : (
                    spool.date_opened
                  )}
                </td>
                <td>
                  {editingId === spool.id ? (
                    <input
                      type="number"
                      step="0.01"
                      className="inline-input"
                      value={formData.remaining_kg}
                      onChange={e => setFormData({...formData, remaining_kg: parseFloat(e.target.value) || 0})}
                      autoFocus
                    />
                  ) : (
                    `${spool.remaining_kg.toFixed(2)} kg`
                  )}
                </td>
                <td>
                  {editingId === spool.id ? (
                    <input
                      className="inline-input"
                      value={formData.shelf}
                      onChange={e => setFormData({...formData, shelf: e.target.value})}
                    />
                  ) : (
                    spool.shelf
                  )}
                </td>
                <td>
                  {spool.date_finished ?
                    <span className="badge badge-info">Finished</span> :
                    spool.remaining_kg > 0 ?
                      <span className="badge badge-success">In Use</span> :
                      <span className="badge badge-warning">Empty</span>
                  }
                </td>
                <td>
                  {editingId === spool.id ? (
                    <input
                      type="date"
                      className="inline-input"
                      value={formData.date_finished}
                      onChange={e => setFormData({...formData, date_finished: e.target.value})}
                    />
                  ) : (
                    spool.date_finished || '-'
                  )}
                </td>
                <td className="actions">
                  {editingId === spool.id ? (
                    <>
                      <button className="btn btn-small btn-primary" onClick={() => handleSave(spool.id)}>Save</button>
                      <button className="btn btn-small btn-secondary" onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-small btn-secondary" onClick={() => handleEdit(spool)} disabled={isAdding || editingId}>Update</button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(spool.id)} disabled={isAdding || editingId}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {isAdding && (
              <tr className="editing-row new-row">
                <td>
                  <select
                    className="inline-input"
                    value={formData.filament_name}
                    onChange={e => setFormData({...formData, filament_name: e.target.value})}
                    autoFocus
                  >
                    <option value="">Select filament...</option>
                    {filaments.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                  </select>
                </td>
                <td>
                  <input
                    type="date"
                    className="inline-input"
                    value={formData.date_opened}
                    onChange={e => setFormData({...formData, date_opened: e.target.value})}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    className="inline-input"
                    value={formData.remaining_kg}
                    onChange={e => setFormData({...formData, remaining_kg: parseFloat(e.target.value) || 0})}
                    placeholder="kg"
                  />
                </td>
                <td>
                  <input
                    className="inline-input"
                    value={formData.shelf}
                    onChange={e => setFormData({...formData, shelf: e.target.value})}
                    placeholder="Shelf"
                  />
                </td>
                <td>-</td>
                <td>
                  <input
                    type="date"
                    className="inline-input"
                    value={formData.date_finished}
                    onChange={e => setFormData({...formData, date_finished: e.target.value})}
                  />
                </td>
                <td className="actions">
                  <button className="btn btn-small btn-primary" onClick={() => handleSave('new')}>Save</button>
                  <button className="btn btn-small btn-secondary" onClick={handleCancel}>Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
