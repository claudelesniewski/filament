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

// Vendors Tab
function VendorsTab() {
  const [vendors, setVendors] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)

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
        <button className="btn btn-primary" onClick={() => {setShowModal(true); setEditingVendor(null)}}>
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
              <tr key={vendor.id}>
                <td><strong>{vendor.name}</strong></td>
                <td>{vendor.notes}</td>
                <td className="actions">
                  <button className="btn btn-small btn-secondary" onClick={() => {setEditingVendor(vendor); setShowModal(true)}}>Edit</button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(vendor.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <VendorModal
          vendor={editingVendor}
          onClose={() => {setShowModal(false); setEditingVendor(null)}}
          onSave={() => {loadVendors(); setShowModal(false); setEditingVendor(null)}}
        />
      )}
    </div>
  )
}

function VendorModal({ vendor, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    notes: vendor?.notes || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (vendor) {
        await api.updateVendor(vendor.id, formData)
      } else {
        await api.createVendor(formData)
      }
      onSave()
    } catch (error) {
      alert('Error saving vendor: ' + error.response?.data?.detail)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{vendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Filaments Tab
function FilamentsTab() {
  const [filaments, setFilaments] = useState([])
  const [vendors, setVendors] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingFilament, setEditingFilament] = useState(null)

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
        <button className="btn btn-primary" onClick={() => {setShowModal(true); setEditingFilament(null)}}>
          + Add Filament
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Manufacturer</th>
              <th>Line</th>
              <th>Material</th>
              <th>Color</th>
              <th>Feature</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filaments.map(filament => (
              <tr key={filament.id}>
                <td><strong>{filament.name}</strong></td>
                <td>{filament.manufacturer}</td>
                <td>{filament.line}</td>
                <td><span className="badge badge-info">{filament.material}</span></td>
                <td>{filament.color}</td>
                <td>{filament.feature}</td>
                <td>{filament.date_added}</td>
                <td className="actions">
                  <button className="btn btn-small btn-secondary" onClick={() => {setEditingFilament(filament); setShowModal(true)}}>Edit</button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(filament.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <FilamentModal
          filament={editingFilament}
          vendors={vendors}
          onClose={() => {setShowModal(false); setEditingFilament(null)}}
          onSave={() => {loadFilaments(); setShowModal(false); setEditingFilament(null)}}
        />
      )}
    </div>
  )
}

function FilamentModal({ filament, vendors, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: filament?.name || '',
    manufacturer: filament?.manufacturer || '',
    line: filament?.line || '',
    material: filament?.material || 'PLA',
    product: filament?.product || '',
    color: filament?.color || '',
    feature: filament?.feature || '',
    date_added: filament?.date_added || new Date().toISOString().split('T')[0],
    url: filament?.url || '',
    notes: filament?.notes || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (filament) {
        await api.updateFilament(filament.id, formData)
      } else {
        await api.createFilament(formData)
      }
      onSave()
    } catch (error) {
      alert('Error saving filament: ' + error.response?.data?.detail)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{filament ? 'Edit Filament' : 'Add Filament'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Manufacturer *</label>
              <select
                required
                value={formData.manufacturer}
                onChange={e => setFormData({...formData, manufacturer: e.target.value})}
              >
                <option value="">Select...</option>
                {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Product Line</label>
              <input
                value={formData.line}
                onChange={e => setFormData({...formData, line: e.target.value})}
              />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label>Material *</label>
              <select
                required
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
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                value={formData.color}
                onChange={e => setFormData({...formData, color: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Feature</label>
              <input
                value={formData.feature}
                onChange={e => setFormData({...formData, feature: e.target.value})}
                placeholder="e.g., Matte, Silk"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Product</label>
              <input
                value={formData.product}
                onChange={e => setFormData({...formData, product: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Date Added *</label>
              <input
                type="date"
                required
                value={formData.date_added}
                onChange={e => setFormData({...formData, date_added: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Purchases Tab
function PurchasesTab() {
  const [purchases, setPurchases] = useState([])
  const [filaments, setFilaments] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadPurchases()
    loadFilaments()
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
          onClose={() => setShowModal(false)}
          onSave={() => {loadPurchases(); setShowModal(false)}}
        />
      )}
    </div>
  )
}

function PurchaseModal({ filaments, onClose, onSave }) {
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
                onChange={e => setFormData({...formData, subtotal: parseFloat(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Tax</label>
              <input
                type="number"
                step="0.01"
                value={formData.tax}
                onChange={e => setFormData({...formData, tax: parseFloat(e.target.value)})}
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
                  <select
                    required
                    value={item.filament_name}
                    onChange={e => updateItem(idx, 'filament_name', e.target.value)}
                  >
                    <option value="">Select...</option>
                    {filaments.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label>Spools *</label>
                    <input
                      type="number"
                      required
                      value={item.spools}
                      onChange={e => updateItem(idx, 'spools', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Kg/Spool *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.kg_per_spool}
                      onChange={e => updateItem(idx, 'kg_per_spool', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.unit_price}
                      onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value))}
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

// Spools Tab
function SpoolsTab() {
  const [spools, setSpools] = useState([])
  const [filaments, setFilaments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingSpool, setEditingSpool] = useState(null)

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
        <button className="btn btn-primary" onClick={() => {setShowModal(true); setEditingSpool(null)}}>
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
              <tr key={spool.id}>
                <td><strong>{spool.filament_name}</strong></td>
                <td>{spool.date_opened}</td>
                <td>{spool.remaining_kg.toFixed(2)} kg</td>
                <td>{spool.shelf}</td>
                <td>
                  {spool.date_finished ?
                    <span className="badge badge-info">Finished</span> :
                    spool.remaining_kg > 0 ?
                      <span className="badge badge-success">In Use</span> :
                      <span className="badge badge-warning">Empty</span>
                  }
                </td>
                <td>{spool.date_finished || '-'}</td>
                <td className="actions">
                  <button className="btn btn-small btn-secondary" onClick={() => {setEditingSpool(spool); setShowModal(true)}}>Update</button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(spool.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <SpoolModal
          spool={editingSpool}
          filaments={filaments}
          onClose={() => {setShowModal(false); setEditingSpool(null)}}
          onSave={() => {loadSpools(); setShowModal(false); setEditingSpool(null)}}
        />
      )}
    </div>
  )
}

function SpoolModal({ spool, filaments, onClose, onSave }) {
  const [formData, setFormData] = useState({
    filament_name: spool?.filament_name || '',
    date_opened: spool?.date_opened || new Date().toISOString().split('T')[0],
    date_finished: spool?.date_finished || '',
    shelf: spool?.shelf || '',
    remaining_kg: spool?.remaining_kg || 1.0,
    notes: spool?.notes || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (spool) {
        await api.updateSpool(spool.id, formData)
      } else {
        await api.createSpool(formData)
      }
      onSave()
    } catch (error) {
      alert('Error saving spool: ' + error.response?.data?.detail)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{spool ? 'Update Spool' : 'Open New Spool'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Filament *</label>
            <select
              required
              disabled={!!spool}
              value={formData.filament_name}
              onChange={e => setFormData({...formData, filament_name: e.target.value})}
            >
              <option value="">Select...</option>
              {filaments.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date Opened *</label>
              <input
                type="date"
                required
                value={formData.date_opened}
                onChange={e => setFormData({...formData, date_opened: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Date Finished</label>
              <input
                type="date"
                value={formData.date_finished}
                onChange={e => setFormData({...formData, date_finished: e.target.value})}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Remaining (kg) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.remaining_kg}
                onChange={e => setFormData({...formData, remaining_kg: parseFloat(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Shelf</label>
              <input
                value={formData.shelf}
                onChange={e => setFormData({...formData, shelf: e.target.value})}
                placeholder="e.g., A1LB"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default App
