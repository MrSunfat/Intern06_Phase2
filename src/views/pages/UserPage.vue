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
          @focused-row-changed="handleShowDetailUser"
          @focused-row-changing="handleShowDetailUser"
        >
          <DxColumn data-field="FullName" :caption="userInfo.FullName" />
          <DxColumn data-field="Position" :caption="userInfo.Position" />
          <DxColumn data-field="Room" :caption="userInfo.Room" />
          <DxColumn data-field="Office" :caption="userInfo.Office" />
          <DxColumn data-field="UserGroup" :caption="userInfo.UserGroup" />
          <DxColumn data-field="StatusWork" :caption="userInfo.StatusWork" />
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
    <!-- <BaseOption class="option" /> -->
    <PopupEditUserGroup
      v-show="isShowPopupEditUserGroup"
      @hiddenPopupEditUserGroup="handleHidePopupEditUserGroup"
    />
  </div>
</template>

<script>
import { sidebarTitles, placholderText, userInfo } from "@/scripts/constants";
import {
  userData,
  userGroupData,
  buttomEnum,
  currentRecord,
} from "@/scripts/enum";
import DxSelectBox from "devextreme-vue/select-box";
import { DxDataGrid, DxColumn } from "devextreme-vue/data-grid";
import BaseInputSearch from "@/components/base/BaseInputSearch.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BasePagination from "@/components/base/BasePagination.vue";
// import BaseOption from "@/components/base/BaseOption.vue";
import BaseDetailUser from "@/components/base/BaseDetailUser.vue";
import PopupEditUserGroup from "@/components/base/PopupEditUserGroup.vue";

export default {
  name: "UserPage",
  data() {
    return {
      sidebarTitles,
      placholderText,
      userInfo,
      userData,
      userGroupData,
      buttomEnum,
      currentRecord,
      valueSearch: "",
      isShowDetailUser: false,
      isShowPopupEditUserGroup: false,
    };
  },
  components: {
    DxSelectBox,
    DxDataGrid,
    DxColumn,
    BaseInputSearch,
    BaseButton,
    BasePagination,
    // BaseOption,
    BaseDetailUser,
    PopupEditUserGroup,
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
    handleShowDetailUser() {
      console.log("Show Detail User");
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
  },
  created() {
    this.userData = this.userData.map((user) => {
      if (user.StatusWork) {
        return {
          ...user,
          StatusWork: "Đang hoạt động",
        };
      } else {
        return {
          ...user,
          StatusWork: "Đang nghỉ",
        };
      }
    });
  },
};
</script>

<style scoped>
.user {
  position: relative;
  padding: 16px 20px;
  height: 100%;
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
.user__header__right .input-search {
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
</style>