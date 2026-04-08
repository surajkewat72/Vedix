import { useState } from 'react'
import { useChartStore } from '../stores/chartStore'
import { MapPin, Calendar, Clock, Sparkles, Loader } from 'lucide-react'

export default function BirthForm({ onSuccess }) {
  const { submitBirthDetails, loading, error } = useChartStore()
  const [form, setForm] = useState({
    name: '',
    birth_date: '',
    birth_time: '12:00',
    birth_city: '',
  })
  const [localError, setLocalError] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setLocalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.birth_date || !form.birth_city) {
      setLocalError('Please fill in all required fields.')
      return
    }

    try {
      const chart = await submitBirthDetails(form)
      onSuccess?.(chart)
    } catch (err) {
      setLocalError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div>
        <label className="label" htmlFor="name">
          <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Name *
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input-field"
          placeholder="Your full name"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="birth_date">
          <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Date of Birth *
        </label>
        <input
          id="birth_date"
          type="date"
          name="birth_date"
          value={form.birth_date}
          onChange={handleChange}
          className="input-field"
          required
          max={new Date().toISOString().split('T')[0]}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div>
        <label className="label" htmlFor="birth_time">
          <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Time of Birth
          <span style={{ color: 'var(--color-text-dim)', fontWeight: '400', textTransform: 'none', marginLeft: '6px' }}>
            (approx. is fine)
          </span>
        </label>
        <input
          id="birth_time"
          type="time"
          name="birth_time"
          value={form.birth_time}
          onChange={handleChange}
          className="input-field"
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div>
        <label className="label" htmlFor="birth_city">
          <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Birth City / Place *
        </label>
        <input
          id="birth_city"
          type="text"
          name="birth_city"
          value={form.birth_city}
          onChange={handleChange}
          className="input-field"
          placeholder="e.g. Mumbai, New Delhi, London..."
          required
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '6px' }}>
          Enter the city where you were born. We use this to calculate your exact chart.
        </p>
      </div>

      {(localError || error) && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#f87171',
          fontSize: '0.875rem',
        }}>
          ⚠️ {localError || error}
        </div>
      )}

      <button
        type="submit"
        id="birth-form-submit"
        className="btn-primary"
        disabled={loading}
        style={{ width: '100%', padding: '14px' }}
      >
        {loading ? (
          <>
            <Loader size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />
            Calculating Your Chart…
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Reveal My Birth Chart
          </>
        )}
      </button>
    </form>
  )
}
