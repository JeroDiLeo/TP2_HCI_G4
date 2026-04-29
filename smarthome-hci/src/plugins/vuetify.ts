/**
 * plugins/vuetify.ts
 *
 * Vuetify 4 configuration with SmartHome custom theme
 */

import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import '../styles/layers.css'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          // SmartHome palette
          primary: '#6366F1',
          'primary-dark': '#4F46E5',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          error: '#EF4444',
        },
      },
    },
    utilities: false,
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 840,
      lg: 1145,
      xl: 1545,
      xxl: 2138,
    },
  },
})
