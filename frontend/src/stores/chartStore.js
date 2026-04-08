import { create } from 'zustand'
import { chartApi } from '../lib/api'

export const useChartStore = create((set, get) => ({
  chart: null,
  hasBirthDetails: false,
  loading: false,
  error: null,

  fetchMyChart: async () => {
    if (get().hasBirthDetails) return;
    set({ loading: true, error: null })
    try {
      const result = await chartApi.getMyChart()
      if (result.success && result.data) {
        set({
          chart: result.data.chart_data,
          hasBirthDetails: true,
          loading: false,
        })
      } else {
        set({ chart: null, hasBirthDetails: false, loading: false })
      }
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  submitBirthDetails: async (details) => {
    set({ loading: true, error: null })
    try {
      const result = await chartApi.calculate(details)
      if (result.success) {
        set({ chart: result.chart, hasBirthDetails: true, loading: false })
        return result.chart
      } else {
        throw new Error(result.message || 'Chart calculation failed')
      }
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  clearChart: () => set({ chart: null, hasBirthDetails: false }),
}))
