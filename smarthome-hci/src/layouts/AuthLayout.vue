<template>
  <div class="auth-layout">

    <!-- ── Columna izquierda: formulario ── -->
    <main class="auth-layout__form-col" role="main">
      <!-- Logo: esquina superior izquierda -->
      <div class="auth-layout__logo" aria-label="SmartHome">
        <span class="auth-layout__logo-smart">Smart</span><span class="auth-layout__logo-home">Home</span>
      </div>

      <!-- Contenido inyectado por la vista (formulario) -->
      <div class="auth-layout__form-wrapper">
        <slot />
      </div>
    </main>

    <!-- ── Columna derecha: foto login ── -->
    <section
      class="auth-layout__hero-col"
      aria-hidden="true"
    >
      <!-- Imagen de fondo -->
      <img
        :src="heroImage"
        :alt="heroImageAlt"
        class="auth-layout__hero-img"
      >

      <!-- Overlay violeta  -->
      <div class="auth-layout__hero-overlay" />

      <!-- Texto en la parte inferior izquierda -->
      <div class="auth-layout__hero-content">
        <h2 class="auth-layout__hero-title">{{ heroTitle }}</h2>
        <p class="auth-layout__hero-subtitle">{{ heroSubtitle }}</p>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
// Vite requiere importar las imágenes de src/assets para procesarlas correctamente
import defaultHeroImage from '@/assets/images/loginPhoto.jpg'

// Props para personalizar el panel derecho en cada vista de auth
withDefaults(
  defineProps<{
    heroImage?: string
    heroImageAlt?: string
    heroTitle?: string
    heroSubtitle?: string
  }>(),
  {
    heroImage: defaultHeroImage,
    // heroImageAlt: texto alternativo para lectores de pantalla y cuando la imagen no carga
    heroImageAlt: 'Persona controlando robot aspiradora con su celular',
    heroTitle: 'La tranquilidad de estar siempre presente.',
    heroSubtitle: 'Controlá luces, clima, persianas y rutinas desde un solo lugar.',
  },
)
</script>

<style scoped>
/* ─── Layout principal ── */
.auth-layout {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* ─── Columna izquierda ── */
.auth-layout__form-col {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 50%;
  background-color: #ffffff;
}

/* Logo fijo en esquina superior izquierda */
.auth-layout__logo {
  position: absolute;
  top: 2rem;
  left: 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  z-index: 1;
}

.auth-layout__logo-smart {
  color: #0F172A;
}

.auth-layout__logo-home {
  color: #6366F1;
}

/* Wrapper del formulario: centrado vertical y horizontal */
.auth-layout__form-wrapper {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem 3rem; /* espacio superior para el logo */
}

/* ─── Columna derecha (hero) ── */
.auth-layout__hero-col {
  position: relative;
  width: 50%;
  overflow: hidden;
}

.auth-layout__hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Overlay violeta semi-transparente */
.auth-layout__hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(99, 102, 241, 0.40);
  z-index: 1;
}

/* Texto anclado al área inferior izquierda */
.auth-layout__hero-content {
  position: absolute;
  bottom: 3rem;
  left: 3rem;
  right: 3rem;
  z-index: 2;
}

.auth-layout__hero-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.auth-layout__hero-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
}

/* ─── Responsive: mobile oculta el hero ── */
@media (max-width: 839px) {
  .auth-layout__form-col {
    width: 100%;
  }

  .auth-layout__hero-col {
    display: none;
  }
}
</style>
