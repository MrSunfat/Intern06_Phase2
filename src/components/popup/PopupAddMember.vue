<template>
  <div class="popup-add-member">
    <div class="popup-add-member__container">
      <div class="icon-size close" @click="handleHidePopupAddMember">
        <div class="icon-title-size"></div>
      </div>
      <div class="popup-add-member__header">
        <h1 class="title bold">Thêm thành viên</h1>
      </div>
      <div class="popup-add-member__main">
        <div class="control">
          <BaseInputSearch
            class="control__search w-307"
            :placeholderText="placholderText.SearchUser"
            :valueText="pageDetail.searchWord"
            @twoWayValue="modelValueSearch"
            @enterKey="handleEnterKeyWhenSearch"
          />
          <DxTagBox
            class="control__tagbox w-307"
            :data-source="jobTitles"
            display-expr="JobTitleName"
            value-expr="JobTitleName"
            placeholder="Tất cả chức vụ"
            @valueChanged="handleSelectJobTitle"
            :search-enabled="true"
            noDataText="Không có dữ liệu"
          />
          <DxDropDownBox
            v-model:value="treeBoxValue"
            v-model:opened="isTreeBoxOpened"
            :show-clear-button="true"
            :data-source="treeDataSource"
            value-expr="ID"
            display-expr="name"
            placeholder="Select a value..."
            @value-changed="syncTreeViewSelection($event)"
          >
            <template #content="{ data }">
              {{ data.value }}
              <DxTreeView
                :ref="treeViewRefName"
                :data-source="treeDataSource"
                :select-by-click="true"
                data-structure="plain"
                key-expr="ID"
                parent-id-expr="categoryId"
                selection-mode="single"
                display-expr="name"
                @content-ready="$event.component.selectItem(treeBoxValue)"
                @item-selection-changed="treeView_itemSelectionChanged($event)"
                @item-click="onTreeItemClick($event)"
              />
            </template>
          </DxDropDownBox>
        </div>
        <div class="body">
          <div class="body__content">
            <span class="select">{{ membersWillAdd.length }} đang chọn</span>
            <span class="unchecked" @click="handleUnchecked">Bỏ chọn</span>
          </div>
          <div class="body__main">
            <DxDataGrid
              :data-source="users"
              key-expr="UserID"
              :remote-operations="false"
              :allow-column-reordering="true"
              :allow-column-resizing="true"
              :show-borders="false"
              :focused-row-enabled="true"
              :selection-filter="selectionFilter"
              v-model:selected-row-keys="membersWillAdd"
              @selection-changed="onSelectionChanged"
            >
              <DxSelection
                mode="multiple"
                show-check-boxes-mode="always"
                :value="true"
              />
              <DxColumn
                v-for="property in showPropertiesNeed"
                :key="property.Field"
                :data-field="property.Field"
                :caption="property.Name"
              />
              <DxPaging :enabled="false" />
            </DxDataGrid>
            <div class="loading" v-show="isLoading">
              <LoadingComp />
            </div>
          </div>
          <div class="body__footer">
            <BasePagination
              :pageNumber="pageDetail.pageNumber"
              :totalPage="totalPage"
              :totalRecord="totalUsers"
              :recordStart="userStart"
              :recordEnd="userEnd"
              @pageSize="handleChangePageSize"
              @prevPage="handleLoadDataInPage"
              @nextPage="handleLoadDataInPage"
            />
          </div>
        </div>
      </div>
      <div class="popup-add-member__footer">
        <BaseButton
          class="mg-r-12"
          :nameBtn="buttomEnum.nameBtn.Cancel"
          :type="buttomEnum.typeBtn.Text"
          @click="handleHidePopupAddMember"
        />
        <BaseButton
          class="mg-r-12"
          :nameBtn="buttomEnum.nameBtn.Agree"
          :type="buttomEnum.typeBtn.Primary"
          @click="handleSaveMemberForUserGroup"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import BaseButton from "@/components/base/BaseButton.vue";
// import { DxCheckBox } from "devextreme-vue/check-box";
import {
  DxDataGrid,
  DxColumn,
  DxSelection,
  DxPaging,
} from "devextreme-vue/data-grid";
import {
  buttomEnum,
  userGroupData,
  positionEnum,
  statusTagEnum,
  userData,
  userPropertiesEnum,
} from "@/scripts/enum";
import { userGroupInfo, userInfo } from "@/scripts/constants";
import { placholderText } from "@/scripts/constants";
import BaseInputSearch from "@/components/base/BaseInputSearch.vue";
import DxTagBox from "devextreme-vue/tag-box";
import BasePagination from "@/components/base/BasePagination.vue";
import DxDropDownBox from "devextreme-vue/drop-down-box";
import DxTreeView from "devextreme-vue/tree-view";
import LoadingComp from "@/components/Loading/LoadingComp.vue";
export default {
  name: "PopupAddMember",
  components: {
    BaseButton,
    BaseInputSearch,
    DxTagBox,
    BasePagination,
    DxDropDownBox,
    DxTreeView,
    DxDataGrid,
    DxColumn,
    DxSelection,
    DxPaging,
    LoadingComp,
    // DxCheckBox,
  },
  data() {
    return {
      buttomEnum,
      placholderText,
      userGroupData,
      statusTagEnum,
      positionEnum,
      userGroupInfo,
      userData,
      userInfo,
      selectedUserNumber: 0,
      userPropertiesEnum,
      isLoading: true,
      usersInPopupAddMember: [],
      pageDetail: {
        pageSize: 50,
        pageNumber: 1,
        searchWord: "",
        jobTitle: "",
        organizationName: "",
      },
      membersWillAdd: [],
      selectedRowKeys: [],
      UserGroupID: "",
      selectionFilter: ["Check", "=", true],
    };
  },
  methods: {
    /**
     * Tạo ra 1 sự kiện đóng popup
     * Author: TNDanh (28/8/2022)
     */
    handleHidePopupAddMember() {
      this.$emit("hiddenPopupAddMember");
    },
    /**
     *
     * Author: TNDanh (31/8/2022)
     */
    onSelectionChanged(data) {
      this.membersWillAdd = [...data.selectedRowKeys];
      console.log(data, this.membersWillAdd);
    },
    /**
     * Lấy users mới
     * Author: TNDanh (7/9/2022)
     */
    handleGetUsers() {
      this.isLoading = true;
      this.$store.dispatch("getUsers", this.pageDetail);
      this.UserGroupID = this.userGroupCurrent.UserGroupID;
    },
    /**
     * Xét các pageSize khác nhau
     * Author: TNDanh (8/9/2022)
     */
    handleChangePageSize(pageSize) {
      this.pageDetail.pageSize = pageSize;
      this.pageDetail.pageNumber = 1;
      this.handleGetUsers();
    },
    /**
     * Đi đến/quay về trang cũ
     * Author: TNDanh (8/9/2022)
     */
    handleLoadDataInPage(idxPage) {
      this.pageDetail.pageNumber = idxPage;
      this.handleGetUsers();
    },
    /**
     * Nhận giá trị khi nhập giá trị trong BaseInputSearch
     * Author: TNDanh (27/8/2022)
     */
    modelValueSearch(value) {
      this.pageDetail.searchWord = value;
    },
    /**
     * Nhấn enter ở ô tìm kiếm thì lấy users mới
     * Author: TNDanh (7/9/2022)
     */
    handleEnterKeyWhenSearch() {
      this.pageDetail.pageNumber = 1;
      this.handleGetUsers();
    },
    /**
     * Xử lý khi nhấn chọn chức vụ
     * Author: TNDanh (12/9/2022)
     */
    handleSelectJobTitle(jobTitle) {
      this.pageDetail.jobTitle = jobTitle.value.join(",");
      this.handleGetUsers();
    },
    /**
     * Gửi sự kiện -> đóng
     * Author: TNDanh (12/9/2022)
     */
    // hanleClosePopupAddMember() {
    //   this.$emit("closePopupAddMember");
    // },
    /**
     * Xử lý khi lưu các member được thêm vào
     * Author: TNDanh (12/9/2022)
     */
    async handleSaveMemberForUserGroup() {
      await this.$store.dispatch("addMembersForUserGroup", {
        userGroupID: this.userGroupCurrent.UserGroupID,
        memberIDs: this.membersWillAdd,
      });
      // await this.$store.dispatch("getUserGroupByID", {
      //   userGroupID: this.userGroupCurrent.serGroupID,
      //   searchWord: "",
      // });
      this.handleHidePopupAddMember();
    },
    /**
     * Bỏ check các phần tử đang check
     * Author: TNDanh (12/9/2022)
     */
    handleUnchecked() {
      this.membersWillAdd = [];
    },
    memberOfUserGroupInUsersData() {
      this.membersWillAdd = this.userGroupCurrent?.map((member) => {
        return member.MemberID;
      });
      //return this.users.map((user) => memberIDs.includes(user.UserID));
    },
  },
  computed: {
    showPropertiesNeed() {
      return this.userPropertiesEnum.filter((property, index) => index <= 5);
    },
    ...mapGetters([
      "users",
      "totalUsers",
      "userStart",
      "userEnd",
      "totalPage",
      "userGroupCurrent",
      "jobTitles",
    ]),
  },
  created() {
    this.handleGetUsers();
  },
  mounted() {
    // this.membersWillAdd = this.userGroupCurrent?.map((member) => {
    //   return member.MemberID;
    // });
  },
  watch: {
    users() {
      this.isLoading = false;
    },
    userGroupCurrent: {
      handler() {
        // this.membersWillAdd = this.userGroupCurrent?.map((member) => {
        //   return member.MemberID;
        // });
        console.log(this.membersWillAdd);
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.popup-add-member {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* Container của popup edit user group */
.popup-add-member__container {
  position: relative;
  background-color: #fff;
  height: var(--height-popup-add-member);
  width: 995px;
  border-radius: 8px;
}

.popup-add-member__container .close {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 24px;
  right: 18px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 4;
}

.popup-add-memberp__container .close:hover {
  background-color: var(--icon-default-hover-bg);
}

.popup-add-member__container .icon-title-size {
  mask: url("../../assets/Icons/ic_sprites_2.svg") no-repeat -216px -24px;
  background-color: var(--icon-default-color);
}

/* header */
.popup-add-member__header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 24px 24px 0;
  z-index: 1;
  height: var(--header-height-popup-edit-user-group);
}

.popup-add-member__header .title {
  margin: 0;
  font-size: 24px;
  color: var(--title-color);
}

/* footer */
.popup-add-member__footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: var(--popup-footer-bg);
  height: var(--footer-height-popup-edit-user-group);
  padding: 0 24px;
  border-top: 1px solid #dadce3;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* main */
.popup-add-member__main {
  position: relative;
  margin-top: 58px;
  padding: 24px 24px 0;
  max-height: calc(
    100% - var(--header-height-popup-edit-user-group) -
      var(--footer-height-popup-edit-user-group)
  );
  height: calc(
    100% - var(--header-height-popup-edit-user-group) -
      var(--footer-height-popup-edit-user-group)
  );
}

.popup-add-member__main .control {
  display: flex;
  justify-content: space-between;
}

/* body */
.popup-add-member__main .body {
  position: relative;
  max-height: calc(100% - 38px);
  height: calc(100% - 38px);
  overflow: hidden;
}

.popup-add-member__main .body__footer {
  position: absolute;
  content: "";
  bottom: 5px;
  right: 0;
  left: 0;
}

.popup-add-member__main .body__main {
  max-height: calc(100% - 38px - 56px);
  height: calc(100% - 38px - 56px);
  overflow: auto;
}

.popup-add-member__main .body__content {
  margin-top: 16px;
  margin-bottom: 16px;
}

.popup-add-member__main .body__content .select {
}

.popup-add-member__main .body__content .unchecked {
  color: var(--primary);
  margin-left: 24px;
}

.popup-add-member__main .control__search {
  height: 38px;
}

.popup-add-member__main .control__tagbox {
  /* height: 38px; */
  min-height: 38px !important;
  max-height: 102px !important;
  overflow-y: auto;
}

.popup-add-member__main .footer {
  position: absolute;
  content: "";
  bottom: 0;
  right: 24px;
  left: 24px;
}

.popup-edit-user-group__main .detail__container {
  color: var(--title-color);
}

.popup-edit-user-group__main_detail {
  align-items: center;
}

.popup-edit-user-group__main .avatar {
  background-color: #000;
  width: 16px;
  height: 16px;
}

.popup-edit-user-group__main__group .title {
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 10px;
}

.popup-edit-user-group__main__group .group__item {
  display: flex;
  align-items: center;
  height: var(--base-checkbox-height);
}
</style>