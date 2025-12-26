import { useState, useEffect } from 'react'
import * as api from './api'

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

  return (
    <div>
      <div className="toolbar">
        <h2>Vendors</h2>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)} disabled={isAdding || editingId}>
          + Add Vendor
        </button>
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

  return (
    <div>
      <div className="toolbar">
        <h2>Filaments</h2>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)} disabled={isAdding || editingId}>
          + Add Filament
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Manufacturer</th>
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

// Purchases Tab with modal (complex nested structure) + ability to create new filament
function PurchasesTab() {
  const [purchases, setPurchases] = useState([])
  const [filaments, setFilaments] = useState([])
  const [vendors, setVendors] = useState([])
  const [showModal, setShowModal] = useState(false)

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

  return (
    <div>
      <div className="toolbar">
        <h2>Purchases</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Purchase
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Marketplace</th>
              <th>Items</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(purchase => (
              <tr key={purchase.id}>
                <td>{purchase.date_ordered}</td>
                <td>{purchase.marketplace}</td>
                <td>{purchase.items.length} item(s)</td>
                <td>${purchase.subtotal.toFixed(2)}</td>
                <td>${purchase.tax.toFixed(2)}</td>
                <td><strong>${(purchase.subtotal + purchase.tax).toFixed(2)}</strong></td>
                <td className="actions">
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(purchase.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <PurchaseModal
          filaments={filaments}
          vendors={vendors}
          onClose={() => setShowModal(false)}
          onSave={() => {loadPurchases(); loadFilaments(); setShowModal(false)}}
        />
      )}
    </div>
  )
}

function PurchaseModal({ filaments, vendors, onClose, onSave }) {
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
    setFormData({...formData, items: formData.items.filter((_, i) => i !== idx)})
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

      // Update the item with the new filament name
      updateItem(idx, 'filament_name', data.name)

      // Hide the form and clear data
      setShowNewFilament({...showNewFilament, [idx]: false})
      setNewFilamentData({...newFilamentData, [idx]: {}})

      // Reload filaments
      const response = await api.getFilaments()
      // We'd need to pass setFilaments down or handle this differently
      alert('Filament created! Please refresh to see it in the dropdown.')
    } catch (error) {
      alert('Error creating filament: ' + error.response?.data?.detail)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.createPurchase(formData)
      onSave()
    } catch (error) {
      alert('Error saving purchase: ' + error.response?.data?.detail)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Add Purchase</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Date Ordered *</label>
              <input
                type="date"
                required
                value={formData.date_ordered}
                onChange={e => setFormData({...formData, date_ordered: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Marketplace</label>
              <input
                value={formData.marketplace}
                onChange={e => setFormData({...formData, marketplace: e.target.value})}
                placeholder="e.g., eBay, Amazon"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Order URL</label>
            <input
              type="url"
              value={formData.order_url}
              onChange={e => setFormData({...formData, order_url: e.target.value})}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Subtotal *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.subtotal}
                onChange={e => setFormData({...formData, subtotal: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="form-group">
              <label>Tax</label>
              <input
                type="number"
                step="0.01"
                value={formData.tax}
                onChange={e => setFormData({...formData, tax: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="purchase-items">
            <h3>Items</h3>
            {formData.items.map((item, idx) => (
              <div key={idx} className="purchase-item">
                <div className="purchase-item-header">
                  <strong>Item {idx + 1}</strong>
                  {formData.items.length > 1 && (
                    <button type="button" className="btn btn-small btn-danger" onClick={() => removeItem(idx)}>Remove</button>
                  )}
                </div>
                <div className="form-group">
                  <label>Filament *</label>
                  <div style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
                    <select
                      required={!showNewFilament[idx]}
                      style={{flex: 1}}
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
                      onClick={() => setShowNewFilament({...showNewFilament, [idx]: !showNewFilament[idx]})}
                    >
                      {showNewFilament[idx] ? 'Cancel' : '+ New'}
                    </button>
                  </div>
                </div>

                {showNewFilament[idx] && (
                  <div className="new-filament-inline">
                    <h4>New Filament</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          value={newFilamentData[idx]?.name || ''}
                          onChange={e => setNewFilamentData({...newFilamentData, [idx]: {...(newFilamentData[idx] || {}), name: e.target.value}})}
                          placeholder="e.g., Brand Name PLA Blue"
                        />
                      </div>
                      <div className="form-group">
                        <label>Manufacturer *</label>
                        <select
                          value={newFilamentData[idx]?.manufacturer || ''}
                          onChange={e => setNewFilamentData({...newFilamentData, [idx]: {...(newFilamentData[idx] || {}), manufacturer: e.target.value}})}
                        >
                          <option value="">Select...</option>
                          {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Material *</label>
                        <select
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
                      </div>
                      <div className="form-group">
                        <label>Color</label>
                        <input
                          value={newFilamentData[idx]?.color || ''}
                          onChange={e => setNewFilamentData({...newFilamentData, [idx]: {...(newFilamentData[idx] || {}), color: e.target.value}})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Feature</label>
                        <input
                          value={newFilamentData[idx]?.feature || ''}
                          onChange={e => setNewFilamentData({...newFilamentData, [idx]: {...(newFilamentData[idx] || {}), feature: e.target.value}})}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-small btn-primary"
                      onClick={() => handleCreateNewFilament(idx)}
                    >
                      Create & Select
                    </button>
                  </div>
                )}

                <div className="form-row-3">
                  <div className="form-group">
                    <label>Spools *</label>
                    <input
                      type="number"
                      required
                      value={item.spools}
                      onChange={e => updateItem(idx, 'spools', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Kg/Spool *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.kg_per_spool}
                      onChange={e => updateItem(idx, 'kg_per_spool', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.unit_price}
                      onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date Received</label>
                    <input
                      type="date"
                      value={item.date_received}
                      onChange={e => updateItem(idx, 'date_received', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Shelf</label>
                    <input
                      value={item.shelf}
                      onChange={e => updateItem(idx, 'shelf', e.target.value)}
                      placeholder="e.g., A1LB"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addItem}>+ Add Item</button>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Purchase</button>
          </div>
        </form>
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

  return (
    <div>
      <div className="toolbar">
        <h2>Spools</h2>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)} disabled={isAdding || editingId}>
          + Open New Spool
        </button>
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
