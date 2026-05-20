<template>
  <div class="avatar-upload">
    <a-avatar :src="modelValue" :size="avatarSize" class="avatar-preview">
      {{ fallbackText }}
    </a-avatar>
    <div class="upload-actions">
      <a-upload
        :show-upload-list="false"
        accept="image/png,image/jpeg,image/gif,image/webp"
        :before-upload="beforeUpload"
        :custom-request="handleUpload"
      >
        <a-button :loading="uploading">
          <UploadOutlined />
          上传头像
        </a-button>
      </a-upload>
      <a-button v-if="modelValue" type="link" class="clear-button" @click="clearAvatar">移除头像</a-button>
      <p class="upload-tip">支持 JPG、PNG、GIF、WebP，大小不超过 2MB。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { uploadUserAvatar } from '@/api/userController.ts'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    fallbackText?: string
    avatarSize?: number
  }>(),
  {
    modelValue: '',
    fallbackText: '墨',
    avatarSize: 88,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uploading = ref(false)

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const maxSize = 2 * 1024 * 1024

const fallbackText = computed(() => props.fallbackText || '墨')

const beforeUpload = (file: File) => {
  if (!allowedTypes.includes(file.type)) {
    message.error('仅支持 JPG、PNG、GIF、WebP 图片')
    return false
  }
  if (file.size > maxSize) {
    message.error('头像不能超过 2MB')
    return false
  }
  return true
}

const handleUpload = async (options: any) => {
  const file = options.file as File
  const formData = new FormData()
  formData.append('file', file)
  uploading.value = true
  try {
    const res = await uploadUserAvatar(formData)
    if (res.data.code === 200 && res.data.data) {
      emit('update:modelValue', res.data.data)
      message.success('头像上传成功')
      options.onSuccess?.(res.data, file)
    } else {
      const errorMessage = res.data.message || '头像上传失败'
      message.error(errorMessage)
      options.onError?.(new Error(errorMessage))
    }
  } catch (error) {
    message.error('头像上传失败')
    options.onError?.(error)
  } finally {
    uploading.value = false
  }
}

const clearAvatar = () => {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 18px;
}

.avatar-preview {
  flex-shrink: 0;
  background: var(--gradient-primary);
}

.upload-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.clear-button {
  padding: 0;
  height: auto;
}

.upload-tip {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 12px;
}
</style>
