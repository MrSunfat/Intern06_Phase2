<template>
  <div class="user">
    <div class="user__header mg-b-16 d-f">
      <div class="user__header__left">
        <h1 class="font-20 bold user__title">{{ sidebarTitles.User.name }}</h1>
      </div>
      <div class="user__header__right center-vertical">
        <div class="dropbox">
          <DxSelectBox
            class="dropbox__container"
            :items="userGroupData"
            display-expr="UserGroupName"
            value-expr="UserGroupID"
            height="100%"
            :placeholder="placholderText.UserGroup"
            :noDataText="placholderText.UserGroupNoData"
          />
        </div>
        <div class="input-search">
          <BaseInputSearch
            class="w-305 mg-l-8"
            :placeholderText="placholderText.InputUser"
            :valueText="this.valueSearch"
            @twoWayValue="modelValueSearch"
          />
        </div>
        <div class="btn-add d-f">
          <BaseButton
            class="mg-l-8"
            :nameBtn="buttomEnum.nameBtn.Import"
            :type="buttomEnum.typeBtn.Primary"
            positionIcon="-237px 0px"
          />
          <BaseButton
            class="mg-l-8"
            :nameBtn="buttomEnum.nameBtn.Export"
            :type="buttomEnum.typeBtn.Primary"
            positionIcon="-46px -48px"
          />
          <BaseButton
            class="mg-l-8"
            :type="buttomEnum.typeBtn.Icon"
            positionIcon="-264px -144px"
            @click="handleToggleOption"
          />
        </div>
      </div>
    </div>
    <div class="user__main">
      <div class="user__content">
        <DxDataGrid
          :data-source="userData"
          key-expr="UserID"
          :remote-operations="false"
          :allow-column-reordering="true"
          :allow-column-resizing="true"
          :show-borders="false"
          :focused-row-enabled="true"
          @row-click="handleShowDetailUser"
        >
          <DxColumn
            v-for="property in showPropertiesSelected"
            :key="property.ID"
            :data-field="property.Field"
            :caption="property.Name"
            :cell-template="property.Field === 'Status' && 'cellTemplateStatus'"
            :alignment="property.Field === 'Status' && 'center'"
          />
          <template #cellTemplateStatus="{ data }">
            <BaseTagStatus
              class="config-tag-status"
              :type="data.value.includes('Đang') ? 'on' : 'off'"
              :content="data.value"
              :dot="statusTagEnum.Dot.Hide"
            />
          </template>
          <DxColumn
            data-field="UserID"
            caption=""
            :width="50"
            cell-template="cellTemplateDelete"
            :allow-reordering="false"
            :allowResizing="false"
          />
          <template #cellTemplateDelete="{ data }">
            <div
              class="icon-size custom-column-delete"
              @click.stop="handleDeleteUser(data.value)"
            >
              <div class="icon-title-size"></div>
            </div>
          </template>
          <DxPaging :enabled="false" />
        </DxDataGrid>
      </div>
      <div class="user__footer d-f">
        <BasePagination />
      </div>
    </div>
    <div class="user__detail" :class="{ hide: !this.isShowDetailUser }">
      <BaseDetailUser
        @hiddenDetailUser="handleHideDetailUser"
        @showPopupUserGroup="handleShowPopupEditUserGroup"
      />
    </div>
    <div
      class="user__option"
      tabindex="-1"
      ref="userOption"
      v-if="isShowOption"
    >
      <BaseOption
        class="option"
        @closeOption="handleHideOption"
        @changePropertiesUser="handleChangePropertiesFollowOption"
      />
    </div>
    <PopupEditUserGroup
      v-show="isShowPopupEditUserGroup"
      @hiddenPopupEditUserGroup="handleHidePopupEditUserGroup"
    />
    <div class="loading" v-show="isLoading">
      <LoadingComp />
    </div>
  </div>
</template>

<script>
import { sidebarTitles, placholderText } from "@/scripts/constants";
import {
  userData,
  userGroupData,
  buttomEnum,
  currentRecord,
  statusTagEnum,
  userPropertiesEnum,
} from "@/scripts/enum";
import DxSelectBox from "devextreme-vue/select-box";
import { DxDataGrid, DxColumn, DxPaging } from "devextreme-vue/data-grid";
import BaseInputSearch from "@/components/base/BaseInputSearch.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import BaseOption from "@/components/base/BaseOption.vue";
import BaseDetailUser from "@/components/base/BaseDetailUser.vue";
import PopupEditUserGroup from "@/components/popup/PopupEditUserGroup.vue";
import BaseTagStatus from "@/components/base/BaseTagStatus.vue";
import LoadingComp from "@/components/Loading/LoadingComp.vue";

export default {
  name: "UserPage",
  data() {
    return {
      sidebarTitles,
      placholderText,
      userData,
      userGroupData,
      userProperties: [],
      buttomEnum,
      statusTagEnum,
      currentRecord,
      valueSearch: "",
      // Biến để kiểm tra show/hide các popup và dialog
      isShowDetailUser: false,
      isShowPopupEditUserGroup: false,
      isShowOption: false,
      isLoading: false,
    };
  },
  components: {
    DxSelectBox,
    DxDataGrid,
    DxColumn,
    DxPaging,
    BaseInputSearch,
    BaseButton,
    BasePagination,
    BaseOption,
    BaseDetailUser,
    PopupEditUserGroup,
    BaseTagStatus,
    LoadingComp,
  },
  methods: {
    /**
     * Nhận giá trị khi nhập giá trị trong BaseInputSearch
     * Author: TNDanh (27/8/2022)
     */
    modelValueSearch(value) {
      this.valueSearch = value;
    },
    /**
     * Xử lý khi nhận sự kiện đóng DetailUser
     * Author: TNDanh (27/8/2022)
     */
    handleHideDetailUser() {
      this.isShowDetailUser = false;
    },
    /**
     * Xử lý khi mở DetailUser
     * Author: TNDanh (27/8/2022)
     */
    handleShowDetailUser(user) {
      console.log("Show Detail User ", user.data.UserID);
      this.isShowDetailUser = true;
    },
    /**
     * Nhận sự kiện mở popup edit userGroup
     * Author: TNDanh (28/8/2022)
     */
    handleShowPopupEditUserGroup() {
      this.isShowPopupEditUserGroup = true;
    },
    /**
     * Nhận sự kiên đóng popup edit userGroup
     * Author: TNDanh (28/8/2022)
     */
    handleHidePopupEditUserGroup() {
      this.isShowPopupEditUserGroup = false;
    },
    /**
     * Mở/ Đóng Otion
     * Author: TNDanh (28/8/2022)
     */
    handleToggleOption() {
      this.isShowOption = !this.isShowOption;
      this.$nextTick(() => {
        this.$refs.userOption.focus();
      });
    },
    /**
     * Đóng popup option
     * Author: TNDanh (28/8/2022)
     */
    handleHideOption() {
      this.isShowOption = false;
    },
    /**
     * Xử lý khi nhấn nút xóa 1 user
     * Author: TNDanh (30/8/2022)
     */
    handleDeleteUser(userID) {
      console.log("Xóa - ", userID);
      // alert(`userID - ${user.data.UserID}`);
    },
    /**
     * Xử lý cơ bản dữ liệu đầu vào của user
     * Author: TNDanh (31/8/2022)
     */
    handleUserData() {
      this.userData = this.userData.map((user) => {
        return {
          ...user,
          Status:
            user.Status === 3
              ? statusTagEnum.Content.Work
              : statusTagEnum.Content.InActive,
          OrganizationUnitName: user.OrganizationUnitName
            ? user.OrganizationUnitName
            : "-",
        };
      });
    },
    /**
     * Nhận các thuộc tính của user
     * Author: TNDanh (31/8/2022)
     */
    receivePropertiesUser() {
      this.userProperties =
        JSON.parse(localStorage.getItem("userProperties")) ||
        userPropertiesEnum;
    },
    /**
     * Xét các thuộc tính của user nhận theo sự thay đổi của tùy chỉnh cột
     * Author: TNDanh (31/8/2022)
     */
    handleChangePropertiesFollowOption(newProperties) {
      this.userProperties = newProperties;
    },
  },
  computed: {
    showPropertiesSelected() {
      return this.userProperties.filter((property) => property.Selected);
    },
  },
  created() {
    this.handleUserData();
    this.receivePropertiesUser();
  },
  mounted() {},
  watch: {},
};
</script>

<style scoped>
.user {
  position: relative;
  padding: 16px 20px;
  height: 100%;
}

.loading {
  position: absolute;
  content: "";
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(251, 251, 251, 0.3);
}

.user__header {
  height: var(--base-heigth);
  align-items: center;
  justify-content: space-between;
}

/* header left của user */
.user__title {
  margin: 0;
}

/* header right của user */
.user__header__right {
  justify-content: space-between;
}

.user__main {
  position: relative;
  height: calc(100vh - var(--height-header) - var(--base-heigth) - 48px);
  overflow-y: hidden;
}

.user__content {
  max-height: calc(100% - var(--footer-height));
  overflow: scroll;
}

.user__content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.user__content::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px #e5e5e5;
  border-radius: 4px;
}

.user__content::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 4px;
}

.user__footer {
  position: absolute;
  content: "";
  left: 0;
  right: 0;
  bottom: 0;
}

/* Detail User */
.user__detail {
  position: fixed;
  content: "";
  top: 0;
  bottom: 0;
  right: 0;
  width: var(--detail-user-width);
  z-index: 1;
  box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
  background-color: #fff;
  transition: all 0.25s ease-in;
}

.user__detail.hide {
  --hide: calc(var(--detail-user-width) + 100px);
  right: calc(0px - var(--hide));
}

/* Option user */
.user__option {
  position: fixed;
  top: 118px;
  right: 0;
  width: 330px;
  height: 570px;
  background: #fff;
  box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
  border-radius: 8px;
  /* overflow: hidden; */
}

.user__option::before {
  position: absolute;
  top: 0;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;

  border-bottom: 5px solid #000;
}

/* config tag status */
.config-tag-status {
  padding: 0 !important;
  justify-content: center;
  width: 150px;
  margin: 0 auto;
}

.custom-column-delete {
  display: none;
  align-items: center;
  justify-content: center;
}

.custom-column-delete .icon-title-size {
  -webkit-mask: url("../../assets/Icons/ic_sprites_2.svg") no-repeat -168px -24px;
  mask: url("../../assets/Icons/ic_sprites_2.svg") no-repeat -168px -24px;
  background-color: var(--delete-icon-color);
}

.dx-datagrid-rowsview .dx-row:hover .custom-column-delete {
  display: flex;
}
</style>