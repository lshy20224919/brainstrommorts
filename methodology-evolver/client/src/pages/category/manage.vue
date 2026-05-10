<template>
  <view class="page-categories">
    <!-- 标题 -->
    <view class="page-header">
      <text class="page-title">分类管理</text>
      <text class="page-desc">管理你的卡片分类</text>
    </view>

    <!-- 分类列表 -->
    <view class="category-list">
      <view 
        class="category-item" 
        v-for="cat in categories" 
        :key="cat.category_id"
      >
        <view class="cat-info">
          <text class="cat-name">{{ cat.category_name }}</text>
          <text class="cat-count">{{ cat.card_count || 0 }}张卡片</text>
        </view>
        <view class="cat-actions">
          <text class="action-icon" @tap="editCategory(cat)">📝</text>
          <text 
            class="action-icon" 
            v-if="!cat.is_system" 
            @tap="deleteCategory(cat)"
          >🗑️</text>
          <text class="system-tag" v-else>系统</text>
        </view>
      </view>
    </view>

    <!-- 新增按钮 -->
    <view class="add-category" @tap="showAddModal">
      <text class="add-icon">+</text>
      <text>新增分类</text>
    </view>

    <!-- 新增/编辑弹窗 -->
    <view class="modal-mask" v-if="showModal" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text>{{ editingCategory ? '编辑分类' : '新增分类' }}</text>
        </view>
        <view class="modal-body">
          <input 
            class="modal-input" 
            v-model="categoryName" 
            placeholder="请输入分类名称"
            maxlength="20"
          />
        </view>
        <view class="modal-footer">
          <view class="btn btn-cancel" @tap="closeModal">取消</view>
          <view class="btn btn-primary" @tap="saveCategory">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'

export default {
  data() {
    return {
      categories: [],
      showModal: false,
      categoryName: '',
      editingCategory: null
    }
  },
  
  onLoad() {
    this.loadCategories()
  },
  
  onShow() {
    this.loadCategories()
  },
  
  methods: {
    async loadCategories() {
      try {
        const res = await api.categories.list()
        this.categories = res.data || []
      } catch (e) {
        console.error('获取分类失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    
    showAddModal() {
      this.editingCategory = null
      this.categoryName = ''
      this.showModal = true
    },
    
    editCategory(cat) {
      if (cat.is_system) {
        uni.showToast({ title: '系统分类不能编辑', icon: 'none' })
        return
      }
      this.editingCategory = cat
      this.categoryName = cat.category_name
      this.showModal = true
    },
    
    closeModal() {
      this.showModal = false
      this.categoryName = ''
      this.editingCategory = null
    },
    
    async saveCategory() {
      if (!this.categoryName.trim()) {
        uni.showToast({ title: '请输入分类名称', icon: 'none' })
        return
      }
      
      try {
        if (this.editingCategory) {
          // 编辑
          await api.categories.update(this.editingCategory.category_id, {
            category_name: this.categoryName.trim()
          })
          uni.showToast({ title: '修改成功', icon: 'success' })
        } else {
          // 新增
          await api.categories.create({
            category_name: this.categoryName.trim()
          })
          uni.showToast({ title: '创建成功', icon: 'success' })
        }
        
        this.closeModal()
        this.loadCategories()
      } catch (e) {
        console.error('保存失败', e)
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    
    deleteCategory(cat) {
      if (cat.is_system) {
        uni.showToast({ title: '系统分类不能删除', icon: 'none' })
        return
      }
      
      if (cat.card_count > 0) {
        uni.showModal({
          title: '无法删除',
          content: `该分类下有${cat.card_count}张卡片，请先迁移或删除卡片`,
          showCancel: false
        })
        return
      }
      
      uni.showModal({
        title: '确认删除',
        content: `确定要删除分类"${cat.category_name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.categories.delete(cat.category_id)
              uni.showToast({ title: '删除成功', icon: 'success' })
              this.loadCategories()
            } catch (e) {
              console.error('删除失败', e)
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import '@/static/variables.scss';

.page-categories {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 24rpx;
}

.page-header {
  margin-bottom: 30rpx;
  
  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 8rpx;
  }
  
  .page-desc {
    font-size: 26rpx;
    color: $text-light;
  }
}

.category-list {
  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    background-color: $card-bg;
    border-radius: 16rpx;
    margin-bottom: 16rpx;
  }
}

.cat-info {
  flex: 1;
  
  .cat-name {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 4rpx;
  }
  
  .cat-count {
    font-size: 24rpx;
    color: $text-light;
  }
}

.cat-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
  
  .action-icon {
    font-size: 36rpx;
    padding: 8rpx;
  }
  
  .system-tag {
    padding: 8rpx 16rpx;
    background-color: $bg-color;
    border-radius: 8rpx;
    font-size: 22rpx;
    color: $text-light;
  }
}

.add-category {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 30rpx;
  background-color: $card-bg;
  border-radius: 16rpx;
  border: 2px dashed $border-color;
  
  .add-icon {
    font-size: 40rpx;
    color: $primary-color;
  }
  
  text {
    font-size: 28rpx;
    color: $primary-color;
  }
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 600rpx;
  background-color: $card-bg;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  padding: 30rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
  border-bottom: 1px solid $border-color;
}

.modal-body {
  padding: 30rpx;
}

.modal-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: $bg-color;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: $text-color;
}

.modal-footer {
  display: flex;
  border-top: 1px solid $border-color;
}

.btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  
  &.btn-cancel {
    color: $text-color;
    border-right: 1px solid $border-color;
  }
  
  &.btn-primary {
    color: $primary-color;
    font-weight: bold;
  }
}
</style>
