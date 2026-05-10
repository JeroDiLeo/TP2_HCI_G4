<template>
  <article
    class="dcc"
    :class="{
      'dcc--off': !d.active && NEEDS_TOGGLE[device.type],
      'dcc--busy': isExecuting,
      'dcc--error': !!actionError,
      'dcc--edit': editMode,
      'dcc--vacuum': device.type === 'vacuum',
    }"
    :aria-label="`${device.name}, ${d.active ? 'activo' : 'inactivo'}`"
    :aria-busy="isExecuting ? 'true' : 'false'"
  >
    <!-- ── Header ── -->
    <div class="dcc__header">
      <div class="dcc__id">
        <div class="dcc__icon-tile" aria-hidden="true">
          <v-icon :icon="getDeviceIcon(device.type)" size="16" />
        </div>
        <div class="dcc__names">
          <span class="dcc__name">{{ device.name }}</span>
          <span class="dcc__room" :class="{ 'dcc__room--error': !!actionError }">
            <span :title="actionError || undefined">{{ statusText }}</span>
          </span>
        </div>
      </div>

      <label v-if="NEEDS_TOGGLE[device.type]" class="toggle">
        <input
          type="checkbox"
          class="toggle__input"
          role="switch"
          :aria-label="`${d.active ? 'Apagar' : 'Encender'} ${device.name}`"
          :aria-checked="d.active"
          :checked="d.active"
          :disabled="isExecuting || editMode"
          @change="onPowerToggle"
        />
        <span class="toggle__track" />
      </label>
      <button
        v-else-if="device.type === 'blind'"
        type="button"
        class="toggle dcc__blind-toggle"
        role="switch"
        :aria-label="`${blindPosition > 0 ? 'Cerrar' : 'Abrir'} ${device.name}`"
        :aria-checked="blindPosition > 0"
        :disabled="isExecuting || editMode"
        @click="toggleBlind"
      >
        <span class="toggle__track" />
      </button>
    </div>

    <!-- ── Edit overlay con botones centrados ── -->
    <div v-if="editMode" class="dcc__edit-overlay">
      <div class="dcc__edit-actions">
        <button
          type="button"
          class="dcc__edit-action-btn"
          :aria-label="`Editar dispositivo ${device.name}`"
          @click.stop="emit('edit', device)"
        >
          <v-icon icon="mdi-pencil-outline" size="20" aria-hidden="true" />
          Editar dispositivo
        </button>
        <button
          type="button"
          class="dcc__edit-action-btn dcc__edit-action-btn--danger"
          :aria-label="`Eliminar dispositivo ${device.name}`"
          @click.stop="emit('delete', device)"
        >
          <v-icon icon="mdi-trash-can-outline" size="20" aria-hidden="true" />
          Eliminar
        </button>
      </div>
    </div>

    <div class="dcc__body">

    <!-- ══════════════════════════════════════════════
         LIGHT
    ══════════════════════════════════════════════ -->
    <template v-if="device.type === 'light'">
      <div class="dcc__status-panel">
        <div
          class="lamp-circle"
          :style="{ backgroundColor: d.color, opacity: d.active ? 1 : 0.35 }"
          aria-hidden="true"
        />
        <div class="dcc__stat-col">
          <span class="dcc__panel-meta">{{ d.intensity }}% intensidad</span>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">COLOR DE LA LUZ</span>
        <div class="dcc__swatches" role="group" aria-label="Colores predefinidos">
          <button
            v-for="c in LAMP_COLORS" :key="c"
            type="button" class="dcc__swatch"
            :class="{ 'dcc__swatch--active': d.color === c }"
            :style="{ backgroundColor: c }"
            :aria-label="`Color ${c}`"
            :disabled="!d.active"
            @click="action('setColor', [c]); hexDraft = c"
          />
        </div>
        <div class="dcc__color-input-row">
          <span class="dcc__color-preview" :style="{ backgroundColor: hexDraft }" />
          <input
            v-model="hexDraft"
            type="text" class="dcc__hex-input"
            maxlength="7" placeholder="#000000"
            :disabled="!d.active"
            aria-label="Color en formato hexadecimal"
            @keydown.enter="applyHex"
          />
          <button type="button" class="dcc__apply-btn" :disabled="!d.active" @click="applyHex">
            Aplicar
          </button>
        </div>
      </div>

      <div class="dcc__section">
        <div class="dcc__section-label-row">
          <span class="dcc__section-label">INTENSIDAD</span>
          <span class="dcc__section-value">{{ d.intensity }} / 100</span>
        </div>
        <div class="dcc__slider-row">
          <v-icon icon="mdi-brightness-4" size="16" class="dcc__slider-icon" />
          <v-slider
            :model-value="d.intensity"
            :min="0" :max="100" :step="1"
            color="#6366F1" track-color="#E2E8F0"
            hide-details density="compact"
            :disabled="!d.active"
            aria-label="Intensidad de la lámpara"
            class="dcc__slider"
            @update:model-value="action('setBrightness', [$event])"
          />
          <v-icon icon="mdi-brightness-7" size="16" class="dcc__slider-icon" />
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         AC
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'ac'">
      <div class="dcc__status-panel">
        <div class="dcc__stat-row">
          <div class="dcc__stat-group">
            <span class="dcc__stat-label">TEMP.</span>
            <span class="dcc__stat-value dcc__stat-value--lg">{{ d.temperature }}<span class="dcc__unit">°C</span></span>
          </div>
          <div class="dcc__stat-group">
            <span class="dcc__stat-label">MODO</span>
            <span class="dcc__stat-value">{{ d.mode }}</span>
          </div>
          <div class="dcc__stat-group">
            <span class="dcc__stat-label">VENT.</span>
            <span class="dcc__stat-value">{{ d.fanSpeed }}</span>
          </div>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">TEMPERATURA</span>
        <v-slider
          :model-value="d.temperature"
          :min="18" :max="38" :step="1"
          color="#6366F1" track-color="#E2E8F0"
          hide-details density="compact"
          :disabled="!d.active"
          aria-label="Temperatura del aire acondicionado (18–38°C)"
          class="dcc__slider"
          @update:model-value="action('setTemperature', [$event])"
        />
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">MODO</span>
        <div class="dcc__segment" role="group" aria-label="Modo">
          <button v-for="m in AC_MODES" :key="m.value" type="button" class="dcc__seg-btn"
            :class="{ 'dcc__seg-btn--active': d.mode === m.value }"
            :disabled="!d.active"
            @click="action('setMode', [AC_MODE_FRONT_TO_API[m.value] ?? m.value])">{{ m.label }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">ASPAS VERTICALES</span>
        <div class="dcc__chips" role="group">
          <button v-for="v in AC_VERT" :key="v.value" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.verticalBlades === v.value }"
            :disabled="!d.active"
            @click="action('setVerticalSwing', [AC_SWING_FRONT_TO_API[v.value] ?? v.value])">{{ v.label }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">ASPAS HORIZONTALES</span>
        <div class="dcc__chips" role="group">
          <button v-for="h in AC_HORIZ" :key="h.value" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.horizontalBlades === h.value }"
            :disabled="!d.active"
            @click="action('setHorizontalSwing', [AC_SWING_FRONT_TO_API[h.value] ?? h.value])">{{ h.label }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">VELOCIDAD VENTILADOR</span>
        <div class="dcc__chips" role="group">
          <button v-for="f in AC_FAN" :key="f.value" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.fanSpeed === f.value }"
            :disabled="!d.active"
            @click="action('setFanSpeed', [AC_FAN_FRONT_TO_API[f.value] ?? f.value])">{{ f.label }}</button>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         VACUUM
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'vacuum'">
      <div class="dcc__status-panel dcc__vacuum-status">
        <div class="dcc__stat-col">
          <span class="dcc__badge" :class="{
            'dcc__badge--on':   d.vacuumStatus === 'encendida',
            'dcc__badge--warn': d.vacuumStatus === 'pausada',
            'dcc__badge--off':  d.vacuumStatus === 'apagada',
          }">{{ vacuumStatusLabel }}</span>
          <span class="dcc__panel-meta">{{ vacuumStatusMessage }}</span>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">MODO</span>
        <div class="dcc__segment" role="group" aria-label="Modo aspiradora">
          <button v-for="m in VACUUM_MODES" :key="m.value" type="button" class="dcc__seg-btn"
            :class="{ 'dcc__seg-btn--active': d.vacuumMode === m.value }"
            :disabled="!d.active"
            @click="action('setMode', [VACUUM_MODE_FRONT_TO_API[m.value] ?? m.value])">
            <v-icon :icon="m.icon" size="14" aria-hidden="true" />
            {{ m.label }}
          </button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">HABITACIÓN OBJETIVO</span>
        <v-select
          v-model="vacuumTargetRoom"
          class="dcc__vacuum-select"
          :items="activeRooms"
          item-title="name"
          item-value="id"
          density="compact"
          hide-details
          variant="outlined"
          placeholder="Seleccioná una habitación"
          aria-label="Habitación objetivo para la aspiradora"
          :menu-props="{ contentClass: 'dcc-vacuum-menu' }"
          @update:model-value="v => { if (v) action('setLocation', [v]) }"
        >
          <template #selection="{ item }">
            <span class="dcc__vacuum-selection">
              <v-icon :icon="roomIcon(selectItemRoom(item))" size="16" aria-hidden="true" />
              <span>{{ selectItemRoom(item).name }}</span>
            </span>
          </template>
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" class="dcc-vacuum-menu__item">
              <template #prepend>
                <span class="dcc-vacuum-menu__thumb" aria-hidden="true">
                  <v-icon :icon="roomIcon(selectItemRoom(item))" size="18" />
                </span>
              </template>
              <template #append>
                <v-icon
                  v-if="String(selectItemRoom(item).id) === String(vacuumTargetRoom)"
                  icon="mdi-check"
                  size="16"
                  class="dcc-vacuum-menu__check"
                  aria-hidden="true"
                />
              </template>
            </v-list-item>
          </template>
        </v-select>
      </div>

      <div class="dcc__section dcc__section--actions">
        <button v-if="d.vacuumStatus === 'encendida'" type="button" class="dcc__action-btn dcc__vacuum-primary"
          :disabled="!d.active"
          @click="action('pause')">
          <v-icon icon="mdi-pause" size="16" /> Pausar
        </button>
        <button v-else-if="d.vacuumStatus === 'pausada'" type="button" class="dcc__action-btn dcc__vacuum-primary"
          @click="action('start')">
          <v-icon icon="mdi-play" size="16" /> Reanudar
        </button>
        <button v-else type="button" class="dcc__action-btn dcc__vacuum-primary"
          @click="action('start')">
          <v-icon icon="mdi-play" size="16" /> Iniciar limpieza
        </button>
        <button type="button" class="dcc__action-btn dcc__action-btn--ghost dcc__vacuum-secondary"
          @click="action('dock')">
          <v-icon icon="mdi-home-import-outline" size="16" /> Regresar a base
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         SPEAKER
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'speaker'">
      <div class="dcc__status-panel">
        <div class="dcc__stat-col">
          <span class="dcc__badge" :class="{
            'dcc__badge--on':  d.playing,
            'dcc__badge--off': !d.playing,
          }">{{ d.playing ? 'Reproduciendo' : 'Detenido' }}</span>
          <span class="dcc__panel-meta">{{ d.genre }}</span>
        </div>
      </div>

      <div class="dcc__section">
        <div class="dcc__section-label-row">
          <span class="dcc__section-label">VOLUMEN</span>
          <span class="dcc__section-value">{{ d.volume }} / 10</span>
        </div>
        <v-slider
          :model-value="d.volume"
          :min="0" :max="10" :step="1"
          color="#6366F1" track-color="#E2E8F0"
          hide-details density="compact"
          :disabled="!d.active"
          aria-label="Volumen del parlante"
          class="dcc__slider"
          @update:model-value="action('setVolume', [$event])"
        />
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">CONTROLES</span>
        <div class="dcc__player-controls">
          <button type="button" class="dcc__player-btn" aria-label="Canción anterior" :disabled="!d.active"
            @click="action('previousSong')">
            <v-icon icon="mdi-skip-previous" size="22" />
          </button>
          <button type="button" class="dcc__player-btn dcc__player-btn--main"
            :aria-label="d.playing ? 'Pausar' : 'Reproducir'" :disabled="!d.active"
            @click="action(d.playing ? 'pause' : 'play')">
            <v-icon :icon="d.playing ? 'mdi-pause' : 'mdi-play'" size="22" />
          </button>
          <button type="button" class="dcc__player-btn" aria-label="Siguiente canción" :disabled="!d.active"
            @click="action('nextSong')">
            <v-icon icon="mdi-skip-next" size="22" />
          </button>
          <button type="button" class="dcc__player-btn" aria-label="Detener" :disabled="!d.active"
            @click="action('stop')">
            <v-icon icon="mdi-stop" size="22" />
          </button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">GÉNERO</span>
        <div class="dcc__chips" role="group">
          <button v-for="g in SPEAKER_GENRES" :key="g" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.genre === g }"
            :disabled="!d.active"
            @click="action('setGenre', [SPEAKER_GENRE_FRONT_TO_API[g] ?? g])">{{ g }}</button>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         FAUCET
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'faucet'">
      <div class="dcc__status-panel">
        <div class="dcc__stat-col">
          <span class="dcc__badge" :class="d.open ? 'dcc__badge--on' : 'dcc__badge--off'">
            {{ d.open ? 'Abierto' : 'Cerrado' }}
          </span>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">VÁLVULA</span>
        <div class="dcc__segment" role="group" aria-label="Estado de la válvula">
          <button type="button" class="dcc__seg-btn" :class="{ 'dcc__seg-btn--active': d.open }"
            @click="action('open')">Abierto</button>
          <button type="button" class="dcc__seg-btn" :class="{ 'dcc__seg-btn--active': !d.open }"
            @click="action('close')">Cerrado</button>
        </div>
      </div>

      <div class="dcc__section">
        <div class="dcc__section-label-row">
          <span class="dcc__section-label">DISPENSAR</span>
          <span class="dcc__section-value">{{ faucetQuantity }} {{ faucetUnit }}</span>
        </div>
        <v-slider
          v-model="faucetQuantity"
          :min="0" :max="100" :step="1"
          color="#6366F1" track-color="#E2E8F0"
          hide-details density="compact"
          aria-label="Cantidad a dispensar"
          class="dcc__slider"
        />
        <div class="dcc__chips dcc__chips--mt" role="group" aria-label="Unidad">
          <button v-for="u in ['ml','cl','dl','l']" :key="u" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': faucetUnit === u }"
            @click="faucetUnit = u">{{ u }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <button type="button" class="dcc__action-btn"
          @click="action('dispense', [faucetQuantity, faucetUnit])">
          <v-icon icon="mdi-water" size="16" /> Dispensar
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         BLIND
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'blind'">
      <div class="dcc__blind-card">
        <div class="dcc__blind-visual-panel">
          <div class="dcc__blind-copy">
            <strong class="dcc__blind-percent">{{ blindPosition }}%</strong>
            <span class="dcc__panel-meta">{{ blindStatusLabel }}</span>
          </div>
        </div>

        <div class="dcc__blind-controls">
          <div class="dcc__section-label-row dcc__blind-label-row">
            <span class="dcc__section-label">POSICIÓN</span>
          </div>
          <v-slider
            :model-value="blindPosition"
            :min="0" :max="100" :step="5"
            color="#6366F1" track-color="#E2E8F0"
            thumb-color="#6366F1"
            hide-details density="compact"
            aria-label="Posición de la persiana"
            class="dcc__slider dcc__blind-slider"
            @update:model-value="action('setLevel', [$event])"
          />

          <div class="dcc__blind-actions" role="group" aria-label="Acciones de la persiana">
            <button
              type="button"
              class="dcc__blind-action dcc__blind-action--primary"
              :disabled="blindPosition === 100"
              @click="setBlindPosition(100)"
            >
              <v-icon icon="mdi-arrow-up" size="17" /> Abrir
            </button>
            <button
              type="button"
              class="dcc__blind-action"
              :disabled="!canStopBlind"
              @click="stopBlind"
            >
              <v-icon icon="mdi-stop" size="16" /> Detener
            </button>
            <button
              type="button"
              class="dcc__blind-action"
              :disabled="blindPosition === 0"
              @click="setBlindPosition(0)"
            >
              <v-icon icon="mdi-arrow-down" size="17" /> Cerrar
            </button>
          </div>

          <div class="dcc__blind-presets" role="group" aria-label="Accesos rápidos de posición">
            <button
              v-for="preset in BLIND_PRESETS"
              :key="preset"
              type="button"
              class="dcc__blind-preset"
              :class="{ 'dcc__blind-preset--active': blindPosition === preset }"
              @click="setBlindPosition(preset)"
            >
              {{ preset }}%
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         OVEN
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'oven'">
      <div class="dcc__oven-card">
        <div class="dcc__oven-temp">
          <div class="dcc__section-label-row dcc__oven-label-row">
            <span class="dcc__section-label">TEMPERATURA</span>
            <span class="dcc__oven-temp-value">{{ d.temperature }}°C</span>
          </div>
          <v-slider
            :model-value="d.temperature"
            :min="90" :max="230" :step="5"
            color="#6366F1" track-color="#E2E8F0"
            thumb-color="#6366F1"
            hide-details density="compact"
            :disabled="!d.active"
            aria-label="Temperatura del horno (90–230°C)"
            class="dcc__slider dcc__oven-slider"
            @update:model-value="action('setTemperature', [$event])"
          />
          <div class="dcc__oven-presets" role="group" aria-label="Presets de temperatura">
            <button
              v-for="p in OVEN_PRESETS"
              :key="p"
              type="button"
              class="dcc__oven-preset"
              :class="{ 'dcc__oven-preset--active': d.temperature === p }"
              :disabled="!d.active"
              @click="action('setTemperature', [p])"
            >
              {{ p }}°C
            </button>
          </div>
        </div>

        <div class="dcc__oven-section">
          <span class="dcc__section-label">FUENTE DE CALOR</span>
          <div class="dcc__oven-options" role="group" aria-label="Fuente de calor">
            <button
              v-for="h in OVEN_HEAT"
              :key="h.value"
              type="button"
              class="dcc__oven-option"
              :class="{ 'dcc__oven-option--active': d.heatSource === h.value }"
              :disabled="!d.active"
              @click="action('setHeat', [OVEN_HEAT_FRONT_TO_API[h.value] ?? h.value])"
            >
              <v-icon :icon="h.icon" size="16" aria-hidden="true" />
              {{ h.label }}
            </button>
          </div>
        </div>

        <div class="dcc__oven-section">
          <span class="dcc__section-label">MODO GRILL</span>
          <div class="dcc__oven-options" role="group" aria-label="Modo grill">
            <button
              v-for="g in OVEN_MODES"
              :key="g.value"
              type="button"
              class="dcc__oven-option"
              :class="{ 'dcc__oven-option--active': d.grillMode === g.value }"
              :disabled="!d.active"
              @click="action('setGrill', [OVEN_GRILL_FRONT_TO_API[g.value] ?? g.value])"
            >
              <v-icon :icon="g.icon" size="16" aria-hidden="true" />
              {{ g.label }}
            </button>
          </div>
        </div>

        <div class="dcc__oven-section">
          <span class="dcc__section-label">MODO CONVECCIÓN</span>
          <div class="dcc__oven-options" role="group" aria-label="Modo convección">
            <button
              v-for="c in OVEN_CONV"
              :key="c.value"
              type="button"
              class="dcc__oven-option"
              :class="{ 'dcc__oven-option--active': d.convectionMode === c.value }"
              :disabled="!d.active"
              @click="action('setConvection', [OVEN_CONVECTION_FRONT_TO_API[c.value] ?? c.value])"
            >
              <v-icon :icon="c.icon" size="16" aria-hidden="true" />
              {{ c.label }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         DOOR
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'door'">
      <div class="dcc__status-panel">
        <div class="dcc__device-icon-block" aria-hidden="true">
          <v-icon :icon="d.open ? 'mdi-door-open' : 'mdi-door-closed'" size="26" />
        </div>
        <div class="dcc__stat-col">
          <div class="dcc__stat-group">
            <span class="dcc__stat-label">ACCESO</span>
            <span class="dcc__stat-value dcc__stat-value--lg" :class="{ 'dcc__stat--on': d.open }">
              {{ d.open ? 'Abierta' : 'Cerrada' }}
            </span>
          </div>
          <div class="dcc__stat-group">
            <span class="dcc__stat-label">SEGURIDAD</span>
            <span class="dcc__stat-value" :class="{ 'dcc__stat--warn': d.locked }">
              {{ d.locked ? 'Bloqueada' : 'Desbloqueada' }}
            </span>
          </div>
        </div>
      </div>

      <div class="dcc__section dcc__section--actions">
        <button type="button" class="dcc__action-btn" :disabled="d.open || d.locked"
          @click="action('open')">
          <v-icon icon="mdi-door-open" size="16" /> Abrir
        </button>
        <button type="button" class="dcc__action-btn dcc__action-btn--ghost" :disabled="!d.open"
          @click="action('close')">
          <v-icon icon="mdi-door-closed" size="16" /> Cerrar
        </button>
      </div>

      <div class="dcc__section dcc__section--actions">
        <button type="button" class="dcc__action-btn" :disabled="d.locked || d.open"
          @click="action('lock')">
          <v-icon icon="mdi-lock" size="16" /> Bloquear
        </button>
        <button type="button" class="dcc__action-btn dcc__action-btn--ghost" :disabled="!d.locked"
          @click="action('unlock')">
          <v-icon icon="mdi-lock-open-outline" size="16" /> Desbloquear
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         ALARM
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'alarm'">
      <div class="dcc__status-panel">
        <div class="dcc__stat-col">
          <span class="dcc__badge" :class="{
            'dcc__badge--on':   d.alarmMode === 'modo regular',
            'dcc__badge--warn': d.alarmMode === 'modo casa',
            'dcc__badge--off':  d.alarmMode === 'desactivada',
          }">
            <v-icon
              :icon="d.alarmMode === 'desactivada' ? 'mdi-shield-off-outline' : d.alarmMode === 'modo casa' ? 'mdi-home-lock' : 'mdi-shield-check'"
              size="12"
              aria-hidden="true"
            />
            {{ d.alarmMode }}
          </span>
        </div>
      </div>

      <div class="dcc__section">
        <label class="dcc__section-label" :for="`alarm-code-${deviceId}`">CÓDIGO DE SEGURIDAD</label>
        <input
          :id="`alarm-code-${deviceId}`"
          v-model="alarmCode"
          type="password"
          class="dcc__code-input"
          maxlength="16"
          autocomplete="off"
          placeholder="Ingresá el código"
          aria-label="Código de seguridad de la alarma"
        />
      </div>

      <div class="dcc__section dcc__section--actions dcc__section--col">
        <button
          type="button"
          class="dcc__action-btn"
          :disabled="isExecuting || !alarmCode || d.alarmMode === 'modo casa'"
          @click="action('arm', ['armedStay', alarmCode])"
        >
          <v-icon icon="mdi-home-lock" size="16" /> Modo Casa
        </button>
        <button
          type="button"
          class="dcc__action-btn"
          :disabled="isExecuting || !alarmCode || d.alarmMode === 'modo regular'"
          @click="action('arm', ['armedAway', alarmCode])"
        >
          <v-icon icon="mdi-shield-check" size="16" /> Modo Regular
        </button>
        <button
          type="button"
          class="dcc__action-btn dcc__action-btn--ghost"
          :disabled="isExecuting || !alarmCode || d.alarmMode === 'desactivada'"
          @click="action('disarm', [alarmCode])"
        >
          <v-icon icon="mdi-shield-off-outline" size="16" /> Desactivar
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         FRIDGE
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'fridge'">
      <div class="dcc__status-panel">
        <div class="dcc__stat-row">
          <div class="dcc__stat-group">
            <span class="dcc__stat-label">
              <v-icon icon="mdi-thermometer" size="12" aria-hidden="true" /> HELADERA
            </span>
            <span class="dcc__stat-value dcc__stat-value--lg">{{ d.fridgeTemp }}<span class="dcc__unit">°C</span></span>
          </div>
          <div class="dcc__stat-group">
            <span class="dcc__stat-label">
              <v-icon icon="mdi-snowflake" size="12" aria-hidden="true" /> FREEZER
            </span>
            <span class="dcc__stat-value dcc__stat-value--lg">{{ d.freezerTemp }}<span class="dcc__unit">°C</span></span>
          </div>
        </div>
      </div>

      <div class="dcc__section">
        <div class="dcc__section-label-row">
          <span class="dcc__section-label">TEMPERATURA HELADERA</span>
          <span class="dcc__section-value">{{ d.fridgeTemp }}°C</span>
        </div>
        <v-slider
          :model-value="d.fridgeTemp"
          :min="fridgeTempMin"
          :max="fridgeTempMax"
          :step="1"
          color="#6366F1" track-color="#E2E8F0"
          hide-details density="compact"
          aria-label="Temperatura de la heladera"
          class="dcc__slider"
          @update:model-value="action('setTemperature', [$event])"
        />
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">MODO</span>
        <div class="dcc__chips" role="group">
          <button v-for="m in FRIDGE_MODES" :key="m" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.fridgeMode === m }"
            @click="action('setMode', [FRIDGE_MODE_FRONT_TO_API[m] ?? m])">{{ m }}</button>
        </div>
      </div>
    </template>

    </div><!-- /.dcc__body -->
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { RoomDevice } from '@/types/rooms'
import { useDevicesStore } from '@/stores/devices'
import { useDeviceTypesStore } from '@/stores/deviceTypes'
import { useRoomsStore } from '@/stores/rooms'
import {
  AC_MODE_FRONT_TO_API,
  AC_SWING_FRONT_TO_API,
  AC_FAN_FRONT_TO_API,
  VACUUM_MODE_FRONT_TO_API,
  OVEN_HEAT_FRONT_TO_API,
  OVEN_GRILL_FRONT_TO_API,
  OVEN_CONVECTION_FRONT_TO_API,
  FRIDGE_MODE_FRONT_TO_API,
  SPEAKER_GENRE_FRONT_TO_API,
} from '@/utils/deviceMapper'
import { getParamMin, getParamMax } from '@/utils/deviceTypeParam'
import { getDeviceIcon } from '@/utils/deviceIcons'

const props = defineProps<{ device: RoomDevice; editMode?: boolean }>()
const emit = defineEmits<{
  (e: 'edit', device: RoomDevice): void
  (e: 'delete', device: RoomDevice): void
}>()
const devicesStore = useDevicesStore()
const deviceTypesStore = useDeviceTypesStore()
const roomsStore = useRoomsStore()

const deviceId = computed(() => String(props.device.id))
const supportedActionNames = computed(() => {
  const deviceType = deviceTypesStore.getByFrontType(props.device.type)
  return new Set((deviceType?.actions ?? []).map(action => action.name))
})
const isExecuting = computed(() => devicesStore.isActionLoading(deviceId.value))
const actionError = computed(() => devicesStore.getActionError(deviceId.value))
const statusText = computed(() => {
  if (isExecuting.value) return 'Actualizando...'
  if (actionError.value) return actionError.value
  return props.device.roomName
})

watch(deviceId, (id, previousId) => {
  if (previousId) devicesStore.clearActionError(previousId)
  devicesStore.clearActionError(id)
})

// ── Live reactive read from store ────────────────────────────────────
// d always reflects current store state
const d = computed<Record<string, any>>(() => {
  return (devicesStore.getDeviceById(deviceId.value) ?? props.device) as Record<string, any>
})

// ── Action helper — calls the API and refetches state ───────────────
async function action(actionName: string, params: unknown[] = []) {
  if (isExecuting.value) return
  if (
    deviceTypesStore.loaded &&
    !supportedActionNames.value.has(actionName)
  ) {
    devicesStore.setActionError(deviceId.value, 'Acción no disponible para este dispositivo')
    return
  }

  try {
    await devicesStore.executeAction(deviceId.value, actionName, params)
  } catch (err) {
    console.error(`Error ejecutando ${actionName}:`, err)
  }
}

// ── Power toggle ─────────────────────────────────────────────────────
function onPowerToggle() {
  if (isExecuting.value) return

  const next = !d.value.active
  if (props.device.type === 'vacuum') {
    action(next ? 'start' : 'dock')
  } else if (props.device.type === 'speaker') {
    action(next ? 'play' : 'stop')
  } else {
    action(next ? 'turnOn' : 'turnOff')
  }
}

// ── Internal configs ─────────────────────────────────────────────────

const NEEDS_TOGGLE: Record<string, boolean> = {
  light: true, ac: true, vacuum: true, speaker: true, oven: true,
  faucet: false, blind: false, door: false, alarm: false, fridge: false,
}

const LAMP_COLORS = [
  '#FEF9C3', '#DBEAFE', '#EF4444', '#F97316',
  '#FCD34D', '#22C55E', '#14B8A6', '#3B82F6',
  '#A855F7', '#EC4899',
]

const AC_MODES = [
  { value: 'ventilación', label: 'Ventilación' },
  { value: 'frío',        label: 'Frío'        },
  { value: 'calor',       label: 'Calor'       },
]
const AC_VERT = [
  { value: 'automático', label: 'Auto' },
  { value: '22',         label: '22°'  },
  { value: '45',         label: '45°'  },
  { value: '67',         label: '67°'  },
  { value: '90',         label: '90°'  },
]
const AC_HORIZ = [
  { value: 'automático', label: 'Auto'  },
  { value: '-90',        label: '-90°'  },
  { value: '-45',        label: '-45°'  },
  { value: '0',          label: '0°'    },
  { value: '45',         label: '45°'   },
  { value: '90',         label: '90°'   },
]
const AC_FAN = [
  { value: 'automático', label: 'Auto'  },
  { value: '25',         label: '25%'   },
  { value: '50',         label: '50%'   },
  { value: '75',         label: '75%'   },
  { value: '100',        label: '100%'  },
]

const OVEN_PRESETS = [120, 150, 180, 200, 220]
const OVEN_HEAT = [
  { value: 'convencional', label: 'Convencional', icon: 'mdi-heat-wave' },
  { value: 'abajo',        label: 'Abajo',        icon: 'mdi-arrow-down-bold-box-outline' },
  { value: 'arriba',       label: 'Arriba',       icon: 'mdi-arrow-up-bold-box-outline' },
]
const OVEN_MODES = [
  { value: 'apagado',   label: 'Apagado',   icon: 'mdi-grill-outline' },
  { value: 'económico', label: 'Económico', icon: 'mdi-leaf' },
  { value: 'completo',  label: 'Completo',  icon: 'mdi-fire' },
]
const OVEN_CONV = [
  { value: 'apagado',      label: 'Apagado',      icon: 'mdi-fan-off' },
  { value: 'económico',    label: 'Económico',    icon: 'mdi-leaf' },
  { value: 'convencional', label: 'Convencional', icon: 'mdi-fan' },
]

const VACUUM_MODES = [
  { value: 'aspirar', label: 'Aspirar', icon: 'mdi-fan' },
  { value: 'trapear', label: 'Trapear', icon: 'mdi-water-outline' },
]

const SPEAKER_GENRES = ['clásica', 'country', 'dance', 'latina', 'pop', 'rock']

const FRIDGE_MODES = ['normal', 'fiesta', 'vacaciones']
const BLIND_PRESETS = [25, 50, 75, 100]

const ROOM_ICONS: Record<string, string> = {
  living:   'mdi-sofa-outline',
  bedroom:  'mdi-bed-king-outline',
  kitchen:  'mdi-silverware-fork-knife',
  bathroom: 'mdi-shower',
  office:   'mdi-briefcase-outline',
}

function toSentenceCase(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}` : ''
}

type SelectRoomItem = {
  id?: number | string
  name?: string
  type?: string
}

function selectItemRoom(item: unknown): SelectRoomItem {
  return ((item as { raw?: SelectRoomItem })?.raw ?? {})
}

function roomIcon(room: SelectRoomItem | undefined) {
  return ROOM_ICONS[room?.type ?? ''] ?? 'mdi-home-outline'
}

// ── Lamp helpers ─────────────────────────────────────────────────────
const initialColor = props.device.type === 'light' ? (props.device as { color: string }).color : '#FFFFFF'
const hexDraft = ref(initialColor)

function applyHex() {
  if (/^#[0-9A-Fa-f]{6}$/.test(hexDraft.value)) {
    action('setColor', [hexDraft.value])
  }
}

// ── Blind helpers ────────────────────────────────────────────────────
const blindPosition = computed(() => {
  const position = Number(d.value.position ?? 0)
  return Math.min(100, Math.max(0, position))
})

function setBlindPosition(position: number) {
  action('setLevel', [position])
}

function toggleBlind() {
  setBlindPosition(blindPosition.value > 0 ? 0 : 100)
}

const blindStatusLabel = computed(() => {
  const p = blindPosition.value
  if (p === 0)   return 'Cerrada'
  if (p === 100) return 'Abierta'
  return toSentenceCase(String(d.value.blindStatus ?? 'Parcialmente abierta'))
})

const canStopBlind = computed(() => {
  return !deviceTypesStore.loaded || supportedActionNames.value.has('stop')
})

function stopBlind() {
  if (canStopBlind.value) action('stop')
}

// ── Faucet — cantidad y unidad son inputs locales para la acción ─────
const faucetQuantity = ref(100)
const faucetUnit = ref('ml')

// ── Alarm — código local, nunca se persiste ni se loguea ────────────
const alarmCode = ref('')

// ── Fridge — rangos desde catálogo, fallback a 2/8°C ────────────────
const fridgeTempMin = computed(() => {
  const param = deviceTypesStore.getByFrontType('fridge')?.actions
    ?.find(a => a.name === 'setTemperature')?.params?.[0]
  return param ? (getParamMin(param) ?? 2) : 2
})

const fridgeTempMax = computed(() => {
  const param = deviceTypesStore.getByFrontType('fridge')?.actions
    ?.find(a => a.name === 'setTemperature')?.params?.[0]
  return param ? (getParamMax(param) ?? 8) : 8
})

// ── Vacuum — rooms del hogar activo para setLocation ─────────────────
const vacuumTargetRoom = ref<string | null>(null)
const activeRooms = computed(() => roomsStore.rooms)
const vacuumStatusLabel = computed(() => toSentenceCase(String(d.value.vacuumStatus ?? '')))
const vacuumStatusMessage = computed(() => {
  if (d.value.vacuumStatus === 'encendida') return 'Limpieza en curso'
  if (d.value.vacuumStatus === 'pausada') return 'Limpieza pausada'
  return 'Listo para limpiar'
})
</script>

<style scoped>
/* ── Card shell ── */
.dcc {
  background: #ffffff;
  border: 1px solid var(--sh-border);
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, .05);
  display: flex;
  flex-direction: column;
  transition: box-shadow 200ms;
  animation: card-in 260ms cubic-bezier(.4,0,.2,1) both;
}
.dcc:hover { box-shadow: 0 4px 12px rgba(15, 23, 42, .08); }
.dcc--off { opacity: .82; }
.dcc--busy .dcc__body {
  pointer-events: none;
  opacity: .72;
}
.dcc--error {
  border-color: rgba(239, 68, 68, .35);
}
.dcc--edit {
  border: 1.5px dashed var(--sh-primary);
  position: relative;
  cursor: grab;
}
.dcc--edit:active { cursor: grabbing; }
.dcc--edit:hover { box-shadow: 0 4px 12px rgba(99, 102, 241, .12); }

/* ── Edit overlay con botones centrados ── */
.dcc__edit-overlay {
  position: absolute;
  inset: 0;
  background: rgba(238, 242, 255, .88);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 2;
}


.dcc__edit-actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.dcc__edit-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  background: #ffffff;
  border: 1.5px solid var(--sh-primary);
  color: var(--sh-primary);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms;
}
.dcc__edit-action-btn:hover { background: var(--sh-primary-light); }
.dcc__edit-action-btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.dcc__edit-action-btn--danger {
  border-color: #ef4444;
  color: #ef4444;
}
.dcc__edit-action-btn--danger:hover { background: #fef2f2; }

/* ── Body (all content below header) ── */
.dcc__body {
  flex: 1;
  overflow-x: hidden;
}

/* ── Header ── */
.dcc__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px 10px;
}
.dcc__id { display: flex; align-items: center; gap: 10px; min-width: 0; }
.dcc__icon-tile {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dcc__names { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.dcc__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dcc__room {
  font-size: 12px;
  color: var(--sh-text-light);
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dcc__room--error {
  color: var(--sh-error);
}

/* ── Toggle switch ── */
.toggle {
  position: relative;
  display: inline-flex;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
}
.toggle__input { position: absolute; opacity: 0; width: 0; height: 0; }
.toggle__track {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #CBD5E1;
  transition: background-color 200ms;
}
.toggle__track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
  transition: transform 200ms cubic-bezier(.4,0,.2,1);
}
.toggle__input:checked ~ .toggle__track { background: var(--sh-primary); }
.toggle__input:checked ~ .toggle__track::after { transform: translateX(20px); }
.toggle:focus-within .toggle__track { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.dcc__blind-toggle {
  padding: 0;
  border: 0;
  background: transparent;
}
.dcc__blind-toggle .toggle__track {
  background: var(--sh-primary);
}
.dcc__blind-toggle[aria-checked="false"] .toggle__track {
  background: #CBD5E1;
}
.dcc__blind-toggle[aria-checked="true"] .toggle__track::after {
  transform: translateX(20px);
}
.dcc__blind-toggle:disabled {
  cursor: not-allowed;
  opacity: .45;
}
.dcc__blind-toggle:focus-visible .toggle__track {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

/* ── Status panel ── */
.dcc__status-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 14px 4px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid var(--sh-border);
}
.dcc__device-icon-block {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dcc__device-icon-block--dark { background: #1e293b; color: #f97316; }

.lamp-circle {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 200ms;
}
.lamp-circle__icon { color: rgba(0,0,0,.45); }

.dcc__stat-col { display: flex; flex-direction: column; gap: 5px; min-width: 0; flex: 1; }
.dcc__stat-group { display: flex; flex-direction: column; gap: 1px; }
.dcc__stat-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--sh-text-light);
  font-family: 'Inter', sans-serif;
}
.dcc__stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
}
.dcc__stat-value--lg    { font-size: 17px; font-weight: 700; line-height: 1.1; }
.dcc__stat-value--song  {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
.dcc__unit     { font-size: .55em; font-weight: 500; color: var(--sh-text-muted); margin-left: 1px; }
.dcc__stat--on   { color: var(--sh-primary); }
.dcc__stat--warn { color: #F59E0B; }
.dcc__color-row  { display: flex; align-items: center; gap: 6px; }
.dcc__color-dot  { width: 14px; height: 14px; border-radius: 3px; border: 1px solid rgba(0,0,0,.1); flex-shrink: 0; }

/* ── Sections ── */
.dcc__section { padding: 8px 16px 0; }
.dcc__section:last-child { padding-bottom: 10px; }
.dcc__section-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--sh-text-light);
  font-family: 'Inter', sans-serif;
  margin-bottom: 5px;
}
.dcc__section-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.dcc__section-value { font-size: 12px; font-weight: 600; color: var(--sh-text-muted); font-family: 'Inter', sans-serif; }

/* ── Vacuum ── */
.dcc--vacuum {
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, .05);
}
.dcc--vacuum.dcc--off {
  opacity: 1;
}
.dcc--vacuum .dcc__header {
  align-items: flex-start;
  padding: 12px 16px 12px;
}
.dcc--vacuum .dcc__id {
  gap: 10px;
}
.dcc--vacuum .dcc__icon-tile {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #EEF0FF;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .75);
}
.dcc--vacuum .dcc__icon-tile :deep(.v-icon) {
  font-size: 16px !important;
}
.dcc--vacuum .dcc__names {
  gap: 1px;
}
.dcc--vacuum .dcc__name {
  font-size: 14px;
  line-height: 1.25;
  font-weight: 600;
}
.dcc--vacuum .dcc__room {
  font-size: 12px;
  line-height: 1.25;
  color: #8A96AD;
}
.dcc--vacuum .toggle {
  width: 44px;
  height: 24px;
  margin-top: 0;
}
.dcc--vacuum .toggle__track {
  background: #CBD4E4;
}
.dcc--vacuum .toggle__track::after {
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.dcc--vacuum .toggle__input:checked ~ .toggle__track::after {
  transform: translateX(20px);
}
.dcc--vacuum .dcc__section {
  padding: 8px 16px 0;
}
.dcc--vacuum .dcc__section-label {
  font-size: 10px;
  line-height: 1.2;
  letter-spacing: .06em;
  font-weight: 600;
  margin-bottom: 5px;
}
.dcc__vacuum-status {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, .98), rgba(248, 250, 255, .96)),
    radial-gradient(circle at 96% 0%, rgba(99, 102, 241, .10), transparent 38%);
}
.dcc--vacuum .dcc__vacuum-status {
  min-height: 58px;
  margin: 0 14px 4px;
  padding: 10px 12px;
  border-radius: 10px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .78);
}
.dcc--vacuum .dcc__badge {
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.1;
  font-weight: 700;
}
.dcc--vacuum .dcc__panel-meta {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.2;
  color: #8190AA;
}
.dcc--vacuum .dcc__segment {
  border-radius: 8px;
  background: #ffffff;
}
.dcc--vacuum .dcc__seg-btn {
  height: 30px;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}
.dcc--vacuum .dcc__seg-btn :deep(.v-icon) {
  font-size: 14px !important;
}
.dcc__vacuum-select {
  font-family: 'Inter', sans-serif;
}
.dcc--vacuum .dcc__vacuum-select :deep(.v-field) {
  min-height: 38px;
  border-radius: 10px;
  background: #ffffff;
  color: var(--sh-text-main);
  box-shadow: 0 1px 2px rgba(15, 23, 42, .03);
  transition: box-shadow 150ms;
}
.dcc--vacuum .dcc__vacuum-select :deep(.v-field--variant-outlined .v-field__outline__start),
.dcc--vacuum .dcc__vacuum-select :deep(.v-field--variant-outlined .v-field__outline__end),
.dcc--vacuum .dcc__vacuum-select :deep(.v-field--variant-outlined .v-field__outline__notch) {
  border-color: var(--sh-border);
  opacity: 1;
  transition: border-color 150ms;
}
.dcc--vacuum .dcc__vacuum-select :deep(.v-field--variant-outlined.v-field--focused .v-field__outline__start),
.dcc--vacuum .dcc__vacuum-select :deep(.v-field--variant-outlined.v-field--focused .v-field__outline__end),
.dcc--vacuum .dcc__vacuum-select :deep(.v-field--variant-outlined.v-field--focused .v-field__outline__notch) {
  border-color: var(--sh-primary);
}
.dcc--vacuum .dcc__vacuum-select :deep(.v-field__input) {
  min-height: 38px;
  padding-top: 0;
  padding-bottom: 0;
  padding-inline: 12px 6px;
  align-items: center;
  color: var(--sh-text-main);
  font-size: 13px;
  font-weight: 600;
}
.dcc--vacuum .dcc__vacuum-select :deep(.v-select__selection) {
  margin: 0;
}
.dcc--vacuum .dcc__vacuum-select :deep(.v-select__selection-text) {
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
}
.dcc__vacuum-selection {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(--sh-text-main);
}
.dcc__vacuum-selection span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dcc__vacuum-selection :deep(.v-icon) {
  color: var(--sh-primary);
  flex-shrink: 0;
}
.dcc--vacuum .dcc__vacuum-select :deep(.v-field__input input::placeholder) {
  color: #8A96AD;
  opacity: 1;
}
.dcc--vacuum .dcc__vacuum-select :deep(.v-field__append-inner) {
  align-items: center;
  color: var(--sh-text-muted);
  padding-top: 0;
  padding-inline-end: 10px;
}
.dcc--vacuum .dcc__vacuum-select :deep(.v-field--focused) {
  color: var(--sh-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .10);
  border-radius: 10px;
}
.dcc--vacuum .dcc__section--actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 10px 16px 12px;
}
.dcc--vacuum .dcc__vacuum-primary,
.dcc--vacuum .dcc__vacuum-secondary {
  width: 100%;
  height: 34px;
  justify-content: center;
  gap: 6px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}
.dcc--vacuum .dcc__vacuum-primary {
  background: linear-gradient(135deg, #6D63F6 0%, #5D5FEF 100%);
  border-color: transparent;
  box-shadow: 0 10px 18px rgba(99, 102, 241, .22);
}
.dcc--vacuum .dcc__vacuum-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5F56EA 0%, #4F51E2 100%);
  border-color: transparent;
}
.dcc--vacuum .dcc__vacuum-secondary {
  background: #F8FAFC;
  color: #64748B;
  border-color: #D7DFEC;
  box-shadow: none;
}
.dcc--vacuum .dcc__vacuum-secondary:hover:not(:disabled) {
  background: #EEF2F7;
  color: var(--sh-text-main);
  border-color: #CBD5E1;
}
:global(.dcc-vacuum-menu) {
  border-radius: 12px !important;
  overflow: hidden;
}
:global(.dcc-vacuum-menu .v-list) {
  border: 1px solid var(--sh-border) !important;
  border-radius: 12px !important;
  box-shadow:
    0 4px 24px rgba(15, 23, 42, .12),
    0 1px 3px rgba(15, 23, 42, .06) !important;
  padding: 4px !important;
  background: #ffffff;
  font-family: 'Inter', sans-serif !important;
}
:global(.dcc-vacuum-menu .v-list-item) {
  min-height: 42px;
  border-radius: 8px !important;
  color: var(--sh-text-main) !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 14px !important;
  font-weight: 500;
  padding-inline: 10px 8px !important;
  transition: background-color 100ms, color 100ms;
}
:global(.dcc-vacuum-menu .v-list-item-title) {
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 1.25 !important;
}
:global(.dcc-vacuum-menu__thumb) {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
  background: var(--sh-primary-light);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--sh-primary);
}
:global(.dcc-vacuum-menu__check) {
  color: var(--sh-primary);
  flex-shrink: 0;
}
:global(.dcc-vacuum-menu .v-list-item:hover > .v-list-item__overlay) {
  opacity: 0 !important;
}
:global(.dcc-vacuum-menu .v-list-item:hover) {
  background: var(--sh-primary-light);
  color: var(--sh-primary-dark) !important;
}
:global(.dcc-vacuum-menu .v-list-item--active) {
  background: var(--sh-primary-light) !important;
  color: var(--sh-primary) !important;
  font-weight: 600;
}
:global(.dcc-vacuum-menu .v-list-item--active .v-list-item__overlay) {
  opacity: 0 !important;
}

/* ── Slider ── */
.dcc__slider { flex: 1; }
.dcc__slider-row { display: flex; align-items: center; gap: 8px; }
.dcc__slider-icon { color: var(--sh-text-light); flex-shrink: 0; }

/* ── Swatches ── */
.dcc__swatches { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 7px; }
.dcc__swatch {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: transform 120ms, border-color 120ms;
}
.dcc__swatch:hover:not(:disabled) { transform: scale(1.15); }
.dcc__swatch--active { border-color: var(--sh-primary); }
.dcc__swatch:disabled { opacity: .4; cursor: not-allowed; }
.dcc__swatch:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

.dcc__color-input-row { display: flex; align-items: center; gap: 8px; }
.dcc__color-preview {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--sh-border);
  flex-shrink: 0;
  transition: background-color 150ms;
}
.dcc__hex-input {
  flex: 1;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--sh-border);
  border-radius: 8px;
  font-family: 'Inter', monospace;
  font-size: 13px;
  color: var(--sh-text-main);
  background: #ffffff;
  outline: none;
  transition: border-color 150ms;
}
.dcc__hex-input:focus { border-color: var(--sh-primary); }
.dcc__hex-input:disabled { opacity: .5; cursor: not-allowed; background: #f8fafc; }
.dcc__apply-btn {
  height: 30px;
  padding: 0 14px;
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  border: 1px solid var(--sh-primary);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms;
}
.dcc__apply-btn:hover:not(:disabled) { background: var(--sh-primary); color: #fff; }
.dcc__apply-btn:disabled { opacity: .4; cursor: not-allowed; }
.dcc__apply-btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

/* ── Segmented control ── */
.dcc__segment { display: flex; border: 1px solid var(--sh-border); border-radius: 8px; overflow: hidden; }
.dcc__seg-btn {
  flex: 1;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: none;
  border-right: 1px solid var(--sh-border);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  padding: 0 8px;
  white-space: nowrap;
  transition: background-color 120ms, color 120ms;
}
.dcc__seg-btn:last-child { border-right: none; }
.dcc__seg-btn--active { color: var(--sh-primary); font-weight: 700; background: var(--sh-primary-light); }
.dcc__seg-btn:hover:not(:disabled):not(.dcc__seg-btn--active) { background: #f1f5f9; }
.dcc__seg-btn:disabled { opacity: .4; cursor: not-allowed; }
.dcc__seg-btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: -2px; }

/* ── Chips ── */
.dcc__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.dcc__chips--mt { margin-top: 8px; }
.dcc__chip {
  height: 24px;
  padding: 0 10px;
  border: 1px solid var(--sh-border);
  border-radius: 999px;
  background: #ffffff;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--sh-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 120ms, background-color 120ms, color 120ms;
}
.dcc__chip--active { background: var(--sh-primary-light); border-color: var(--sh-primary); color: var(--sh-primary); font-weight: 600; }
.dcc__chip:hover:not(:disabled):not(.dcc__chip--active) { border-color: var(--sh-text-muted); }
.dcc__chip:disabled { opacity: .4; cursor: not-allowed; }
.dcc__chip:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }

/* ── Player controls ── */
.dcc__player-controls { display: flex; align-items: center; justify-content: center; gap: 8px; }
.dcc__player-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid var(--sh-border);
  color: var(--sh-text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 120ms, color 120ms;
}
.dcc__player-btn:hover:not(:disabled) { background: var(--sh-primary-light); color: var(--sh-primary); }
.dcc__player-btn:disabled { opacity: .4; cursor: not-allowed; }
.dcc__player-btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.dcc__player-btn--main {
  width: 36px;
  height: 36px;
  background: var(--sh-primary);
  border-color: var(--sh-primary);
  color: #ffffff;
}
.dcc__player-btn--main:hover:not(:disabled) { background: var(--sh-primary-dark); }

/* ── Action buttons ── */
.dcc__section--actions { display: flex; flex-wrap: wrap; gap: 8px; }
.dcc__section--col { flex-direction: column; }
.dcc__action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 14px;
  background: var(--sh-primary);
  color: #ffffff;
  border: 1px solid var(--sh-primary);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms, border-color 150ms;
}
.dcc__action-btn:hover:not(:disabled) { background: var(--sh-primary-dark); border-color: var(--sh-primary-dark); }
.dcc__action-btn:disabled { opacity: .4; cursor: not-allowed; }
.dcc__action-btn:focus-visible { outline: 2px solid var(--sh-primary); outline-offset: 2px; }
.dcc__action-btn--ghost { background: #f1f5f9; color: var(--sh-text-muted); border-color: var(--sh-border); }
.dcc__action-btn--ghost:hover:not(:disabled) { background: #e2e8f0; color: var(--sh-text-main); border-color: var(--sh-text-muted); }

/* ── Oven control ── */
.dcc__oven-card {
  margin: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dcc__oven-temp,
.dcc__oven-section {
  padding: 12px 14px;
  border: 1px solid var(--sh-border);
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, .04);
}
.dcc__oven-temp {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, .98), rgba(248, 250, 255, .94)),
    radial-gradient(circle at 88% 12%, rgba(99, 102, 241, .08), transparent 34%);
}
.dcc__oven-label-row {
  margin-bottom: 2px;
}
.dcc__oven-temp-value {
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
}
.dcc__oven-slider {
  margin-bottom: 6px;
}
.dcc__oven-presets {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  margin-top: 8px;
}
.dcc__oven-preset {
  min-width: 0;
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--sh-border);
  border-radius: 999px;
  background: #F8FAFC;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 140ms ease, background-color 140ms ease, color 140ms ease;
}
.dcc__oven-preset--active {
  border-color: rgba(99, 102, 241, .44);
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  box-shadow: inset 0 2px 0 rgba(99, 102, 241, .44);
}
.dcc__oven-preset:hover:not(:disabled):not(.dcc__oven-preset--active) {
  background: #ffffff;
  border-color: #CBD5E1;
  color: var(--sh-text-main);
}
.dcc__oven-preset:disabled,
.dcc__oven-option:disabled {
  opacity: .42;
  cursor: not-allowed;
}
.dcc__oven-preset:focus-visible,
.dcc__oven-option:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}
.dcc__oven-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid var(--sh-border);
  border-radius: 10px;
  overflow: hidden;
  background: #F8FAFC;
}
.dcc__oven-option {
  min-width: 0;
  height: 36px;
  padding: 0 10px;
  border: 0;
  border-right: 1px solid var(--sh-border);
  background: transparent;
  color: var(--sh-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 140ms ease, color 140ms ease;
}
.dcc__oven-option:last-child {
  border-right: 0;
}
.dcc__oven-option--active {
  background: var(--sh-primary-light);
  color: var(--sh-primary);
}
.dcc__oven-option:hover:not(:disabled):not(.dcc__oven-option--active) {
  background: #ffffff;
  color: var(--sh-text-main);
}

@media (max-width: 520px) {
  .dcc__oven-presets {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .dcc__oven-options {
    grid-template-columns: 1fr;
    border-radius: 12px;
  }
  .dcc__oven-option {
    justify-content: flex-start;
    border-right: 0;
    border-bottom: 1px solid var(--sh-border);
  }
  .dcc__oven-option:last-child {
    border-bottom: 0;
  }
}

/* ── Blind control ── */
.dcc__blind-card {
  margin: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dcc__blind-visual-panel {
  min-height: 118px;
  padding: 16px 18px;
  border: 1px solid var(--sh-border);
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, .98), rgba(248, 250, 255, .94)),
    radial-gradient(circle at 92% 18%, rgba(99, 102, 241, .08), transparent 34%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dcc__blind-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.dcc__blind-percent {
  display: block;
  color: var(--sh-primary);
  font-family: 'Inter', sans-serif;
  font-size: clamp(34px, 6.2vw, 46px);
  font-weight: 700;
  line-height: 1;
}
.dcc__blind-controls {
  padding: 12px 14px;
  border: 1px solid var(--sh-border);
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, .04);
}
.dcc__blind-label-row { margin-bottom: 2px; }
.dcc__blind-slider {
  margin: 0 0 6px;
}
.dcc__blind-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid var(--sh-border);
  border-radius: 999px;
  overflow: hidden;
  background: #F8FAFC;
}
.dcc__blind-action {
  min-width: 0;
  height: 38px;
  border: 0;
  border-right: 1px solid var(--sh-border);
  background: transparent;
  color: var(--sh-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease;
}
.dcc__blind-action:last-child { border-right: 0; }
.dcc__blind-action--primary {
  background: linear-gradient(135deg, #6366F1, #4F46E5);
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(79, 70, 229, .24);
}
.dcc__blind-action:hover:not(:disabled):not(.dcc__blind-action--primary) {
  background: #EEF2FF;
  color: var(--sh-primary);
}
.dcc__blind-action--primary:hover:not(:disabled) { background: #4F46E5; }
.dcc__blind-action:disabled {
  opacity: .42;
  cursor: not-allowed;
  box-shadow: none;
}
.dcc__blind-action:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: -3px;
}
.dcc__blind-presets {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-top: 10px;
}
.dcc__blind-preset {
  height: 32px;
  border: 1px solid var(--sh-border);
  border-radius: 999px;
  background: #F8FAFC;
  color: var(--sh-text-muted);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 140ms ease, background-color 140ms ease, color 140ms ease;
}
.dcc__blind-preset:hover:not(.dcc__blind-preset--active) {
  border-color: #CBD5E1;
  background: #ffffff;
  color: var(--sh-text-main);
}
.dcc__blind-preset--active {
  border-color: rgba(99, 102, 241, .44);
  background: var(--sh-primary-light);
  color: var(--sh-primary);
  box-shadow: inset 0 2px 0 rgba(99, 102, 241, .5);
}
.dcc__blind-preset:focus-visible {
  outline: 2px solid var(--sh-primary);
  outline-offset: 2px;
}

@media (max-width: 520px) {
  .dcc__blind-visual-panel {
    min-height: 108px;
  }
  .dcc__blind-copy {
    align-items: center;
  }
  .dcc__blind-actions {
    border-radius: 14px;
  }
  .dcc__blind-action {
    height: 42px;
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
  }
}

/* ── Alarm inputs ── */
.dcc__code-input {
  width: 100%;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--sh-border);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--sh-text-main);
  background: #ffffff;
  outline: none;
  letter-spacing: .2em;
  margin-bottom: 8px;
  transition: border-color 150ms;
}
.dcc__code-input:focus { border-color: var(--sh-primary); box-shadow: 0 0 0 3px rgba(99,102,241,.12); }

.dcc__change-code { display: flex; flex-direction: column; gap: 6px; }
.dcc__change-code .dcc__code-input { margin-bottom: 0; }

.dcc__error { font-size: 12px; color: var(--sh-error); font-family: 'Inter', sans-serif; margin: 4px 0 0; }
.dcc__msg   { font-size: 12px; font-family: 'Inter', sans-serif; margin: 6px 0 0; }
.dcc__msg--ok  { color: #22C55E; }
.dcc__msg--err { color: var(--sh-error); }

/* ── Refactored panel helpers ── */

/* Full-width stat row — used in AC (3 stats) and Fridge (2 stats) */
.dcc__stat-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

/* Status badges */
.dcc__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  width: fit-content;
}
.dcc__badge--on   { background: var(--sh-primary-light); color: var(--sh-primary); }
.dcc__badge--warn { background: #FEF3C7; color: #D97706; }
.dcc__badge--off  { background: #F1F5F9; color: var(--sh-text-muted); }

/* Row of badges (Vacuum) */
.dcc__badge-row { display: flex; gap: 6px; flex-wrap: wrap; }

/* Small secondary text in status panel */
.dcc__panel-meta {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--sh-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

/* Now-playing block (Speaker) */
.dcc__now-playing {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}
.dcc__now-playing__song {
  font-size: 13px;
  font-weight: 600;
  color: var(--sh-text-main);
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dcc__now-playing__meta {
  font-size: 12px;
  color: var(--sh-text-light);
  font-family: 'Inter', sans-serif;
}

/* Position progress bar (Blind) */
.dcc__progress-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.dcc__progress-track {
  height: 6px;
  border-radius: 999px;
  background: var(--sh-border);
  overflow: hidden;
}
.dcc__progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--sh-primary);
  transition: width 200ms ease;
}

/* ── Animation ── */
@keyframes card-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}
</style>
