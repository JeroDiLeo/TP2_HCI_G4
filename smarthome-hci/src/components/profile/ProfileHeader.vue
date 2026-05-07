<template>
  <div class="profile-header">
    <div class="profile-header__avatar-section">
      <div class="profile-header__avatar-container">
        <img
          v-if="avatarImage"
          :src="avatarImage"
          alt="Avatar"
          class="profile-header__avatar-image"
        />
        <div v-else class="profile-header__avatar">
          {{ initials }}
        </div>
        <button
          class="profile-header__avatar-btn"
          @click="triggerFileInput"
          :title="`Cambiar foto de perfil`"
        >
          <i class="mdi mdi-camera"></i>
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleImageChange"
          style="display: none"
        />
      </div>
      <div class="profile-header__info">
        <h1 class="profile-header__name">{{ user.name }} {{ user.lastName }}</h1>
        <p class="profile-header__role">{{ user.role }}</p>
        <p class="profile-header__email">{{ user.email }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      name: 'Joe',
      lastName: 'Doe',
      role: 'Administrador',
      email: 'joe@example.com',
    }),
  },
})

const emit = defineEmits(['image-changed'])

const fileInput = ref(null)
const avatarImage = ref(null)

const initials = computed(() => {
  const first = props.user.name?.charAt(0) || 'J'
  const last = props.user.lastName?.charAt(0) || 'D'
  return (first + last).toUpperCase()
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageChange = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarImage.value = e.target?.result
      emit('image-changed', file)
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.profile-header {
  padding: 0 24px 24px 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-header__avatar-section {
  display: flex;
  gap: 16px;
  align-items: center;
}

.profile-header__avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.profile-header__avatar,
.profile-header__avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  flex-shrink: 0;
}

.profile-header__avatar {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.profile-header__avatar-image {
  object-fit: cover;
}

.profile-header__avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 14px;
}

.profile-header__avatar-container:hover .profile-header__avatar-btn {
  opacity: 1;
}

.profile-header__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-header__name {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.profile-header__role {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.profile-header__email {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}


@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 24px;
  }

  .profile-header__stats {
    width: 100%;
    justify-content: space-around;
  }
}
</style>
