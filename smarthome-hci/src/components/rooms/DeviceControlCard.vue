<template>
  <article
    class="dcc"
    :class="{ 'dcc--off': !d.active && NEEDS_TOGGLE[device.type] }"
    :aria-label="`${device.name}, ${d.active ? 'activo' : 'inactivo'}`"
  >
    <!-- ── Header ── -->
    <div class="dcc__header">
      <div class="dcc__id">
        <div class="dcc__icon-tile" aria-hidden="true">
          <v-icon :icon="DEVICE_ICONS[device.type]" size="16" />
        </div>
        <div class="dcc__names">
          <span class="dcc__name">{{ device.name }}</span>
          <span class="dcc__room">{{ device.roomName }}</span>
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
          @change="onPowerToggle"
        />
        <span class="toggle__track" />
      </label>
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
            @click="update('color', c); hexDraft = c"
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
            @update:model-value="update('intensity', $event)"
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
          @update:model-value="update('temperature', $event)"
        />
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">MODO</span>
        <div class="dcc__segment" role="group" aria-label="Modo">
          <button v-for="m in AC_MODES" :key="m.value" type="button" class="dcc__seg-btn"
            :class="{ 'dcc__seg-btn--active': d.mode === m.value }"
            :disabled="!d.active"
            @click="update('mode', m.value)">{{ m.label }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">ASPAS VERTICALES</span>
        <div class="dcc__chips" role="group">
          <button v-for="v in AC_VERT" :key="v.value" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.verticalBlades === v.value }"
            :disabled="!d.active"
            @click="update('verticalBlades', v.value)">{{ v.label }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">ASPAS HORIZONTALES</span>
        <div class="dcc__chips" role="group">
          <button v-for="h in AC_HORIZ" :key="h.value" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.horizontalBlades === h.value }"
            :disabled="!d.active"
            @click="update('horizontalBlades', h.value)">{{ h.label }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">VELOCIDAD VENTILADOR</span>
        <div class="dcc__chips" role="group">
          <button v-for="f in AC_FAN" :key="f.value" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.fanSpeed === f.value }"
            :disabled="!d.active"
            @click="update('fanSpeed', f.value)">{{ f.label }}</button>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         VACUUM
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'vacuum'">
      <div class="dcc__status-panel">
        <div class="dcc__stat-col">
          <span class="dcc__badge" :class="{
            'dcc__badge--on':   d.vacuumStatus === 'encendida',
            'dcc__badge--warn': d.vacuumStatus === 'pausada',
            'dcc__badge--off':  d.vacuumStatus === 'apagada',
          }">{{ d.vacuumStatus }}</span>
          <span class="dcc__panel-meta">
            <v-icon icon="mdi-map-marker-outline" size="12" aria-hidden="true" />
            {{ d.targetRoomName }}
          </span>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">MODO</span>
        <div class="dcc__segment" role="group" aria-label="Modo aspiradora">
          <button v-for="m in ['aspirar','trapear']" :key="m" type="button" class="dcc__seg-btn"
            :class="{ 'dcc__seg-btn--active': d.vacuumMode === m }"
            :disabled="!d.active"
            @click="update('vacuumMode', m)">{{ m }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">HABITACIÓN OBJETIVO</span>
        <div class="dcc__chips" role="group">
          <button v-for="r in ROOM_OPTIONS" :key="r.id" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.targetRoomId === r.id }"
            :disabled="!d.active"
            @click="update('targetRoomId', r.id); update('targetRoomName', r.name)">
            {{ r.name }}
          </button>
        </div>
      </div>

      <div class="dcc__section dcc__section--actions">
        <!-- paused → active stays true (only apagada = inactive) -->
        <button v-if="d.vacuumStatus === 'encendida'" type="button" class="dcc__action-btn"
          :disabled="!d.active"
          @click="update('vacuumStatus', 'pausada')">
          <v-icon icon="mdi-pause" size="16" /> Pausar
        </button>
        <button v-if="d.vacuumStatus === 'pausada'" type="button" class="dcc__action-btn"
          @click="update('vacuumStatus', 'encendida')">
          <v-icon icon="mdi-play" size="16" /> Reanudar
        </button>
        <!-- returning to base = fully off -->
        <button type="button" class="dcc__action-btn dcc__action-btn--ghost"
          @click="update('vacuumStatus', 'apagada'); update('active', false)">
          <v-icon icon="mdi-home-import-outline" size="16" /> Regresar a base
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         SPEAKER
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'speaker'">
      <div class="dcc__status-panel">
        <div class="dcc__now-playing">
          <span class="dcc__now-playing__song">{{ d.currentSong }}</span>
          <span class="dcc__now-playing__meta">{{ d.genre }} · {{ d.timestamp }}</span>
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
          @update:model-value="update('volume', $event)"
        />
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">CONTROLES</span>
        <div class="dcc__player-controls">
          <button type="button" class="dcc__player-btn" aria-label="Canción anterior"
            :disabled="!d.active" @click="prevSong">
            <v-icon icon="mdi-skip-previous" size="22" />
          </button>
          <button type="button" class="dcc__player-btn dcc__player-btn--main"
            :aria-label="d.playing ? 'Pausar' : 'Reproducir'" :disabled="!d.active"
            @click="update('playing', !d.playing)">
            <v-icon :icon="d.playing ? 'mdi-pause' : 'mdi-play'" size="22" />
          </button>
          <button type="button" class="dcc__player-btn" aria-label="Detener" :disabled="!d.active"
            @click="update('playing', false); update('timestamp', '0:00')">
            <v-icon icon="mdi-stop" size="22" />
          </button>
          <button type="button" class="dcc__player-btn" aria-label="Siguiente canción"
            :disabled="!d.active" @click="nextSong">
            <v-icon icon="mdi-skip-next" size="22" />
          </button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">GÉNERO</span>
        <div class="dcc__chips" role="group">
          <button v-for="g in SPEAKER_GENRES" :key="g" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.genre === g }"
            :disabled="!d.active"
            @click="update('genre', g)">{{ g }}</button>
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
          <span v-if="d.open" class="dcc__panel-meta">
            <v-icon icon="mdi-water" size="12" aria-hidden="true" />
            {{ d.dispensed }} {{ d.unit }} dispensados
          </span>
          <span v-else class="dcc__panel-meta">sin actividad</span>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">VÁLVULA</span>
        <div class="dcc__segment" role="group" aria-label="Estado de la válvula">
          <button type="button" class="dcc__seg-btn" :class="{ 'dcc__seg-btn--active': d.open }"
            @click="update('open', true); update('active', true)">Abierto</button>
          <button type="button" class="dcc__seg-btn" :class="{ 'dcc__seg-btn--active': !d.open }"
            @click="update('open', false); update('active', false)">Cerrado</button>
        </div>
      </div>

      <div class="dcc__section">
        <div class="dcc__section-label-row">
          <span class="dcc__section-label">CANTIDAD</span>
          <span class="dcc__section-value">{{ d.quantity }} {{ d.unit }}</span>
        </div>
        <v-slider
          :model-value="d.quantity"
          :min="0" :max="100" :step="1"
          color="#6366F1" track-color="#E2E8F0"
          hide-details density="compact"
          aria-label="Cantidad a dispensar"
          class="dcc__slider"
          @update:model-value="update('quantity', $event)"
        />
        <div class="dcc__chips dcc__chips--mt" role="group" aria-label="Unidad">
          <button v-for="u in ['ml','cl','dl','l']" :key="u" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.unit === u }"
            @click="update('unit', u)">{{ u }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <button type="button" class="dcc__action-btn"
          @click="update('dispensed', (d.dispensed as number) + (d.quantity as number)); update('open', true); update('active', true)">
          <v-icon icon="mdi-water" size="16" /> Dispensar
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         BLIND
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'blind'">
      <div class="dcc__status-panel">
        <div class="dcc__progress-wrap">
          <div
            class="dcc__progress-track"
            role="progressbar"
            :aria-valuenow="d.position"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`Persiana al ${d.position}% de apertura`"
          >
            <div class="dcc__progress-fill" :style="{ width: (d.position as number) + '%' }" />
          </div>
          <span class="dcc__panel-meta">{{ d.position }}% · {{ blindStatusLabel }}</span>
        </div>
      </div>

      <div class="dcc__section">
        <div class="dcc__section-label-row">
          <span class="dcc__section-label">POSICIÓN</span>
          <span class="dcc__section-value">{{ d.position }}%</span>
        </div>
        <v-slider
          :model-value="d.position"
          :min="0" :max="100" :step="5"
          color="#6366F1" track-color="#E2E8F0"
          hide-details density="compact"
          aria-label="Posición de la persiana"
          class="dcc__slider"
          @update:model-value="setBlindPosition($event)"
        />
      </div>

      <div class="dcc__section dcc__section--actions">
        <button type="button" class="dcc__action-btn" @click="setBlindPosition(100)">
          <v-icon icon="mdi-arrow-up" size="16" /> Abrir
        </button>
        <button type="button" class="dcc__action-btn dcc__action-btn--ghost" @click="setBlindPosition(0)">
          <v-icon icon="mdi-arrow-down" size="16" /> Cerrar
        </button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════
         OVEN
    ══════════════════════════════════════════════ -->
    <template v-else-if="device.type === 'oven'">
      <div class="dcc__status-panel">
        <div class="dcc__device-icon-block dcc__device-icon-block--dark" aria-hidden="true">
          <v-icon icon="mdi-toaster-oven" size="26" />
        </div>
        <div class="dcc__stat-col">
          <div class="dcc__stat-group">
            <span class="dcc__stat-label">TEMPERATURA</span>
            <span class="dcc__stat-value dcc__stat-value--lg">
              {{ d.temperature }}<span class="dcc__unit">°C</span>
            </span>
          </div>
          <span class="dcc__panel-meta">{{ d.heatSource }} · grill {{ d.grillMode }} · conv. {{ d.convectionMode }}</span>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">TEMPERATURA</span>
        <v-slider
          :model-value="d.temperature"
          :min="90" :max="230" :step="5"
          color="#6366F1" track-color="#E2E8F0"
          hide-details density="compact"
          :disabled="!d.active"
          aria-label="Temperatura del horno (90–230°C)"
          class="dcc__slider"
          @update:model-value="update('temperature', $event)"
        />
        <div class="dcc__chips dcc__chips--mt" role="group" aria-label="Presets de temperatura">
          <button v-for="p in OVEN_PRESETS" :key="p" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.temperature === p }"
            :disabled="!d.active"
            @click="update('temperature', p)">{{ p }}°C</button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">FUENTE DE CALOR</span>
        <div class="dcc__segment" role="group" aria-label="Fuente de calor">
          <button v-for="h in OVEN_HEAT" :key="h.value" type="button" class="dcc__seg-btn"
            :class="{ 'dcc__seg-btn--active': d.heatSource === h.value }"
            :disabled="!d.active"
            @click="update('heatSource', h.value)">{{ h.label }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">MODO GRILL</span>
        <div class="dcc__segment" role="group" aria-label="Modo grill">
          <button v-for="g in OVEN_MODES" :key="g.value" type="button" class="dcc__seg-btn"
            :class="{ 'dcc__seg-btn--active': d.grillMode === g.value }"
            :disabled="!d.active"
            @click="update('grillMode', g.value)">{{ g.label }}</button>
        </div>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">MODO CONVECCIÓN</span>
        <div class="dcc__segment" role="group" aria-label="Modo convección">
          <button v-for="c in OVEN_CONV" :key="c.value" type="button" class="dcc__seg-btn"
            :class="{ 'dcc__seg-btn--active': d.convectionMode === c.value }"
            :disabled="!d.active"
            @click="update('convectionMode', c.value)">{{ c.label }}</button>
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
            <!-- locked = active (security engaged) -->
            <span class="dcc__stat-value" :class="{ 'dcc__stat--warn': d.locked }">
              {{ d.locked ? 'Bloqueada' : 'Desbloqueada' }}
            </span>
          </div>
        </div>
      </div>

      <div class="dcc__section dcc__section--actions">
        <!-- can't open a locked door -->
        <button type="button" class="dcc__action-btn" :disabled="d.open || d.locked"
          @click="update('open', true)">
          <v-icon icon="mdi-door-open" size="16" /> Abrir
        </button>
        <button type="button" class="dcc__action-btn dcc__action-btn--ghost" :disabled="!d.open"
          @click="update('open', false)">
          <v-icon icon="mdi-door-closed" size="16" /> Cerrar
        </button>
      </div>

      <div class="dcc__section dcc__section--actions">
        <!-- can only lock a closed door -->
        <button type="button" class="dcc__action-btn" :disabled="d.locked || d.open"
          @click="update('locked', true); update('active', true)">
          <v-icon icon="mdi-lock" size="16" /> Bloquear
        </button>
        <button type="button" class="dcc__action-btn dcc__action-btn--ghost" :disabled="!d.locked"
          @click="update('locked', false); update('active', false)">
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
        <span class="dcc__section-label">CÓDIGO</span>
        <input
          v-model="alarmCode"
          type="password" class="dcc__code-input"
          maxlength="4" placeholder="• • • •"
          aria-label="Código de seguridad" inputmode="numeric"
        />
        <p v-if="alarmCodeError" class="dcc__error" role="alert">{{ alarmCodeError }}</p>
      </div>

      <div class="dcc__section dcc__section--actions dcc__section--col">
        <button type="button" class="dcc__action-btn" @click="activateAlarm('modo casa')">
          <v-icon icon="mdi-home-lock" size="16" /> Modo Casa
        </button>
        <button type="button" class="dcc__action-btn" @click="activateAlarm('modo regular')">
          <v-icon icon="mdi-shield-check" size="16" /> Modo Regular
        </button>
        <button type="button" class="dcc__action-btn dcc__action-btn--ghost" @click="deactivateAlarm">
          <v-icon icon="mdi-shield-off-outline" size="16" /> Desactivar
        </button>
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">CAMBIAR CÓDIGO</span>
        <div class="dcc__change-code">
          <input v-model="oldCode" type="password" class="dcc__code-input"
            maxlength="4" placeholder="Código actual" aria-label="Código actual" inputmode="numeric" />
          <input v-model="newCode" type="password" class="dcc__code-input"
            maxlength="4" placeholder="Código nuevo" aria-label="Código nuevo" inputmode="numeric" />
          <button type="button" class="dcc__action-btn" @click="changeCode">Cambiar</button>
        </div>
        <p v-if="changeCodeMsg" class="dcc__msg" :class="changeCodeOk ? 'dcc__msg--ok' : 'dcc__msg--err'">
          {{ changeCodeMsg }}
        </p>
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
        <span class="dcc__section-label">HELADERA</span>
        <v-slider
          :model-value="d.fridgeTemp"
          :min="2" :max="8" :step="1"
          color="#6366F1" track-color="#E2E8F0"
          hide-details density="compact"
          aria-label="Temperatura de la heladera (2–8°C)"
          class="dcc__slider"
          @update:model-value="update('fridgeTemp', $event)"
        />
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">FREEZER</span>
        <v-slider
          :model-value="d.freezerTemp"
          :min="-20" :max="-8" :step="1"
          color="#6366F1" track-color="#E2E8F0"
          hide-details density="compact"
          aria-label="Temperatura del freezer (−20 a −8°C)"
          class="dcc__slider"
          @update:model-value="update('freezerTemp', $event)"
        />
      </div>

      <div class="dcc__section">
        <span class="dcc__section-label">MODO</span>
        <div class="dcc__chips" role="group">
          <button v-for="m in FRIDGE_MODES" :key="m" type="button" class="dcc__chip"
            :class="{ 'dcc__chip--active': d.fridgeMode === m }"
            @click="update('fridgeMode', m)">{{ m }}</button>
        </div>
      </div>
    </template>

    </div><!-- /.dcc__body -->
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RoomDevice } from '@/types/rooms'
import { useRoomsStore } from '@/stores/rooms'

const props = defineProps<{ device: RoomDevice }>()
const store = useRoomsStore()

// ── Live reactive read from store ────────────────────────────────────
// d always reflects current store state; mutations go through update()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const d = computed<Record<string, any>>(() => {
  const list = store.getRoomDevices(props.device.roomId)
  return (list.find(dev => dev.id === props.device.id) ?? props.device) as Record<string, any>
})

// ── Mutation helper ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function update(field: string, value: any) {
  store.updateRoomDevice(props.device.roomId, props.device.id, { [field]: value } as Partial<RoomDevice>)
}

// ── Power toggle ─────────────────────────────────────────────────────
function onPowerToggle() {
  const next = !d.value.active
  update('active', next)
  if (props.device.type === 'vacuum') {
    update('vacuumStatus', next ? 'encendida' : 'apagada')
  }
  if (props.device.type === 'speaker' && !next) {
    update('playing', false)
  }
}

// ── Internal configs ─────────────────────────────────────────────────

const DEVICE_ICONS: Record<string, string> = {
  light:   'mdi-lightbulb-outline',
  ac:      'mdi-air-conditioner',
  vacuum:  'mdi-robot-vacuum',
  speaker: 'mdi-speaker',
  faucet:  'mdi-water-pump',
  blind:   'mdi-blinds',
  oven:    'mdi-toaster-oven',
  door:    'mdi-door-closed',
  alarm:   'mdi-shield-outline',
  fridge:  'mdi-fridge-outline',
}

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
  { value: 'convencional', label: 'Convencional' },
  { value: 'abajo',        label: 'Abajo'        },
  { value: 'arriba',       label: 'Arriba'       },
]
const OVEN_MODES = [
  { value: 'apagado',   label: 'Apagado'   },
  { value: 'económico', label: 'Económico' },
  { value: 'completo',  label: 'Completo'  },
]
const OVEN_CONV = [
  { value: 'apagado',      label: 'Apagado'      },
  { value: 'económico',    label: 'Económico'    },
  { value: 'convencional', label: 'Convencional' },
]

const SPEAKER_GENRES = ['clásica', 'country', 'dance', 'latina', 'pop', 'rock']

const SPEAKER_SONGS: Record<string, string[]> = {
  'clásica': ['Moonlight Sonata', 'Symphony No. 5', 'The Four Seasons'],
  'country': ['Take Me Home', 'Jolene', 'Friends in Low Places'],
  'dance':   ["Don't You Worry Child", 'Levels', 'Titanium'],
  'latina':  ['Despacito', 'Bailando', 'Mi Gente'],
  'pop':     ['Blinding Lights', 'Shape of You', 'Bad Guy'],
  'rock':    ['Bohemian Rhapsody', 'Hotel California', "Sweet Child O'Mine"],
}

const FRIDGE_MODES = ['normal', 'fiesta', 'vacaciones']

const ROOM_OPTIONS = [
  { id: 1, name: 'Sala de Estar'        },
  { id: 2, name: 'Habitación Principal' },
  { id: 3, name: 'Cocina'               },
  { id: 4, name: 'Habitación de Tomi'   },
  { id: 5, name: 'Baño Principal'       },
  { id: 6, name: 'Oficina'              },
]

// ── Lamp helpers ─────────────────────────────────────────────────────
const initialColor = props.device.type === 'light' ? (props.device as { color: string }).color : '#FFFFFF'
const hexDraft = ref(initialColor)

function applyHex() {
  if (/^#[0-9A-Fa-f]{6}$/.test(hexDraft.value)) {
    update('color', hexDraft.value)
  }
}

// ── Blind helpers ────────────────────────────────────────────────────
function setBlindPosition(pos: number) {
  const prev = d.value.position as number
  const status = pos === 0
    ? 'cerrada'
    : pos === 100
      ? 'abierta'
      : pos > prev ? 'abriéndose' : 'cerrándose'
  update('position', pos)
  update('blindStatus', status)
  update('active', pos > 0)
}

const blindStatusLabel = computed(() => {
  const p = d.value.position as number
  if (p === 0)   return 'cerrada'
  if (p === 100) return 'abierta'
  return d.value.blindStatus as string
})

// ── Speaker helpers ──────────────────────────────────────────────────
let speakerSongIdx = 0

function nextSong() {
  const list = SPEAKER_SONGS[d.value.genre as string] ?? SPEAKER_SONGS['pop']
  speakerSongIdx = (speakerSongIdx + 1) % list.length
  update('currentSong', list[speakerSongIdx])
  update('timestamp', '0:00')
}

function prevSong() {
  const list = SPEAKER_SONGS[d.value.genre as string] ?? SPEAKER_SONGS['pop']
  speakerSongIdx = (speakerSongIdx - 1 + list.length) % list.length
  update('currentSong', list[speakerSongIdx])
  update('timestamp', '0:00')
}

// ── Alarm helpers ────────────────────────────────────────────────────
const alarmCode      = ref('')
const alarmCodeError = ref('')
const oldCode        = ref('')
const newCode        = ref('')
const changeCodeMsg  = ref('')
const changeCodeOk   = ref(false)

function activateAlarm(mode: 'modo casa' | 'modo regular') {
  if (alarmCode.value === (d.value.code as string)) {
    update('alarmMode', mode)
    update('active', true)
    alarmCodeError.value = ''
    alarmCode.value = ''
  } else {
    alarmCodeError.value = 'Código incorrecto'
  }
}

function deactivateAlarm() {
  if (alarmCode.value === (d.value.code as string)) {
    update('alarmMode', 'desactivada')
    update('active', false)
    alarmCodeError.value = ''
    alarmCode.value = ''
  } else {
    alarmCodeError.value = 'Código incorrecto'
  }
}

function changeCode() {
  if (oldCode.value !== (d.value.code as string)) {
    changeCodeMsg.value = 'Código actual incorrecto'
    changeCodeOk.value = false
    return
  }
  if (!/^\d{4}$/.test(newCode.value)) {
    changeCodeMsg.value = 'El código debe tener 4 dígitos'
    changeCodeOk.value = false
    return
  }
  update('code', newCode.value)
  oldCode.value = ''
  newCode.value = ''
  changeCodeMsg.value = 'Código actualizado'
  changeCodeOk.value = true
}
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
