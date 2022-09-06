<template>
  <div class="user-group">
    <div class="user-group__header mg-b-16">
      <div class="header__left font-20 bold">Nhóm người dùng</div>
      <div class="header__right">
        <BaseInputSearch
          class="input"
          :placeholderText="placholderText.InputUserGroup"
        />
      </div>
    </div>
    <div class="user-group__main">
      <div class="user-group__body">
        <DxDataGrid
          :data-source="userGroupData"
          key-expr="UserGroupID"
          :remote-operations="false"
          :allow-column-reordering="true"
          :allow-column-resizing="true"
          :show-borders="false"
          :focused-row-enabled="true"
          @row-click="handleShowDetailUserGroup"
        >
          <DxColumn
            data-field="UserGroupName"
            :caption="userGroupInfo.GroupName"
          />
          <DxColumn data-field="TotalMember" :caption="userGroupInfo.Members" />
          <DxColumn
            data-field="Description"
            :caption="userGroupInfo.Description"
          />
          <DxColumn
            data-field="Status"
            :caption="userGroupInfo.Status"
            :width="200"
            cell-template="cellTemplateStatus"
          />
          <template #cellTemplateStatus="{ data }">
            <BaseTagStatus
              class="config-tag-status"
              type="on"
              :content="data.value"
              :dot="statusTagEnum.Dot.Hide"
            />
          </template>
        </DxDataGrid>
      </div>
      <div class="user-group__footer">
        <BasePagination />
      </div>
    </div>
    <div class="user-group__detail" v-show="isShowDetailUserGroup">
      <BaseDetailUserGroup
        @hideDetailUserGroup="handleHideDetailUserGroup"
        @showPopupAddMember="handleShowPopupAddMember"
      />
    </div>
    <PopupAddMember
      v-if="isShowPopupAddMember"
      @hiddenPopupAddMember="handleHidePopupAddMember"
    />
  </div>
</template>

<script>
import { placholderText, userGroupInfo } from "@/scripts/constants";
import { userGroupData, statusTagEnum } from "@/scripts/enum";
import { DxDataGrid, DxColumn } from "devextreme-vue/data-grid";
import BaseInputSearch from "@/components/base/BaseInputSearch.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import BaseDetailUserGroup from "@/components/base/BaseDetailUserGroup.vue";
import PopupAddMember from "@/components/popup/PopupAddMember.vue";
import BaseTagStatus from "@/components/base/BaseTagStatus.vue";
export default {
  name: "UserGroup",
  components: {
    BaseInputSearch,
    BasePagination,
    BaseDetailUserGroup,
    PopupAddMember,
    BaseTagStatus,
    DxDataGrid,
    DxColumn,
  },
  data() {
    return {
      userGroupInfo,
      userGroupData,
      placholderText,
      statusTagEnum,
      isShowDetailUserGroup: false,
      isShowPopupAddMember: true,
    };
  },
  methods: {
    /**
     * Mở DetailUserGroup
     * Author: TNDanh (28/8/2022)
     */
    handleShowDetailUserGroup() {
      this.isShowDetailUserGroup = true;
    },
    /**
     * Đóng DetailUserGroup
     * Author: TNDanh (28/8/2022)
     */
    handleHideDetailUserGroup() {
      this.isShowDetailUserGroup = false;
    },
    /**
     * Đóng Popup Add member
     * Author: TNDanh (29/8/2022)
     */
    handleHidePopupAddMember() {
      this.isShowPopupAddMember = false;
    },
    /**
     * Mở Popup Add Member
     * Author: TNDanh (29/8/2022)
     */
    handleShowPopupAddMember() {
      this.isShowPopupAddMember = true;
    },
  },
  created() {
    this.userGroupData = this.userGroupData.map((group) => ({
      ...group,
      Status: group.Status === 1 && statusTagEnum.Content.Use,
    }));
  },
};
</script>

<style scoped>
.user-group {
  position: relative;
  height: 100%;
  padding: 16px 20px;
}

/* Header */
.user-group__header {
  display: flex;
  height: var(--base-heigth);
  justify-content: space-between;
  align-items: center;
}

.user-group__header .input {
  width: 238px;
}

/* --Main-- */
.user-group__main {
  position: relative;
  height: calc(100vh - var(--height-header) - var(--base-heigth) - 48px);
  overflow-y: hidden;
}

/* Body */
.user-group__body {
  max-height: calc(100% - var(--footer-height));
  overflow: scroll;
}

.user-group__body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.user-group__body::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px #e5e5e5;
  border-radius: 4px;
}

.user-group__body::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 4px;
}
/* Footer */
.user-group__footer {
  position: absolute;
  content: "";
  left: 0;
  right: 0;
  bottom: 0;
}

/* Detail */
.user-group__detail {
  position: fixed;
  content: "";
  top: 0;
  bottom: 0;
  right: 0;
  width: var(--detail-user-group-width);
  z-index: 1;
  box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
  background-color: #fff;
  transition: all 0.25s ease-in;
}

/* config tag status */
.config-tag-status {
  padding: 0 !important;
  justify-content: center;
  width: 150px;
}
</style>