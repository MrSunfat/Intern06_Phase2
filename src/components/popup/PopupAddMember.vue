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
          <div class="job-position d-f">
            <div class="job-title-position"></div>
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
          </div>
          <div class="organization-unit-tree">
            <div class="organization-unit-tree__icon"></div>
            <DxDropDownBox
              class="organization-unit-tree__main"
              v-model:value="treeBoxValue"
              v-model:opened="isTreeBoxOpened"
              :show-clear-button="true"
              :data-source="organizationUnits"
              value-expr="OrganizationUnitID"
              display-expr="OrganizationUnitName"
              placeholder="Chọn đơn vị"
              @value-changed="syncTreeViewSelection($event)"
            >
              <template #content>
                <DxTreeView
                  :ref="treeViewRefName"
                  :data-source="organizationUnits"
                  :select-by-click="true"
                  :search-enabled="true"
                  :searchEditorOptions="{ placeholder: 'Tìm kiếm' }"
                  data-structure="plain"
                  key-expr="OrganizationUnitID"
                  parent-id-expr="ParentID"
                  selection-mode="single"
                  display-expr="OrganizationUnitName"
                  title="OrganizationUnitName"
                  @content-ready="$event.component.selectItem(treeBoxValue)"
                  @item-selection-changed="
                    treeView_itemSelectionChanged($event)
                  "
                  @item-click="onTreeItemClick($event)"
                  noDataText="Không có dữ liệu"
                />
              </template>
            </DxDropDownBox>
          </div>
        </div>
        <div class="body" :class="{ 'body-collapse': controlHeight >= 80 }">
          <div
            class="body__content"
            :class="{ show: membersWillAdd.length !== 0 }"
          >
            <span class="select">{{ membersWillAdd.length }} đang chọn</span>
            <span class="unchecked" @click="handleUnchecked">Bỏ chọn</span>
          </div>
          <div
            class="body__main"
            :class="{ 'body-collapse': membersWillAdd.length !== 0 }"
          >
            <DxDataGrid
              :data-source="users"
              key-expr="UserID"
              :remote-operations="false"
              :allow-column-reordering="true"
              :allow-column-resizing="true"
              :show-borders="false"
              :focused-row-enabled="true"
              :selected-row-keys="membersWillAdd"
              @selection-changed="onSelectionChanged"
              height="100%"
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
import { userGroupInfo } from "@/scripts/constants";
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
      controlHeight: 0,
      // Các biến dùng cho cây đơn vị
      organizationUnits: [
        {
          OrganizationUnitID: 2,
          OrganizationUnitCode: "VPTC",
          OrganizationUnitName: "Văn phòng Tổng cục",
          MISACode: "/000/000/000/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 1,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T08:01:55.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2020-12-17T15:01:55.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 3,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Tổng hợp - Thư ký",
          MISACode: "/000/000/000/000/",
          ParentID: 2,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 1,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-11-18T04:13:40.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2020-11-18T11:13:40.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1276,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Văn phòng",
          MISACode: "/000/000/014/000/",
          ParentID: 14,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 1,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-19T08:43:14.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-19T08:43:14.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1109,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Hành chính - Tổng hợp",
          MISACode: "/000/000/014/006/000/",
          ParentID: 1108,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 1,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-07-10T10:51:20.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-07-10T10:51:32.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 28,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Viện Khoa học Thống kê",
          MISACode: "/000/001/000/",
          ParentID: 13,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 1,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T15:06:48.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T15:06:48.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 706,
          OrganizationUnitCode: null,
          OrganizationUnitName:
            "Phòng Nghiên cứu Chiến lược, chính sách phát triển thống kê",
          MISACode: "/000/001/000/000/",
          ParentID: 28,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 1,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-21T12:24:30.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2020-12-21T12:24:30.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 141,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Ban Biên tập",
          MISACode: "/000/001/001/000/",
          ParentID: 29,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 1,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-18T15:49:17.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-18T15:49:17.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1288,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Ban Biên tập",
          MISACode: "/000/001/002/000/",
          ParentID: 992,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 1,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-02-04T02:01:42.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2021-02-04T02:01:42.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 128,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Khoa Thống kê",
          MISACode: "/000/001/003/000/",
          ParentID: 31,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 1,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-18T15:47:43.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-18T15:47:43.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1116,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Khoa Thống kê và Công nghệ thông tin",
          MISACode: "/000/001/004/000/",
          ParentID: 32,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 1,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-02-27T02:47:04.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-02-27T09:47:04.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 4,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Hành chính",
          MISACode: "/000/000/000/001/",
          ParentID: 2,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 2,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-03-03T14:28:09.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-03-03T21:28:09.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1047,
          OrganizationUnitCode: null,
          OrganizationUnitName:
            "Vụ Phương pháp chế độ và Quản lý chất lượng thống kê",
          MISACode: "/000/000/001/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 2,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-13T06:38:46.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-01-13T13:38:46.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1278,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Thiết kế mẫu và Điều tra Thống kê",
          MISACode: "/000/000/014/001/",
          ParentID: 14,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 2,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-19T08:43:14.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-19T08:43:14.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1111,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Phát triển ứng dụng",
          MISACode: "/000/000/014/006/001/",
          ParentID: 1108,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 2,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-06T16:56:22.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-06T16:56:22.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 705,
          OrganizationUnitCode: null,
          OrganizationUnitName:
            "Phòng Nghiên cứu phương pháp, tiêu chuẩn, quy trình thống kê",
          MISACode: "/000/001/000/001/",
          ParentID: 28,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 2,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-21T12:24:30.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2020-12-21T12:24:30.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 29,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Tạp chí Con số và Sự kiện",
          MISACode: "/000/001/001/",
          ParentID: 13,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 2,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T15:07:00.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T15:07:00.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 143,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Ban Thư ký",
          MISACode: "/000/001/001/001/",
          ParentID: 29,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 2,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-18T15:49:27.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-18T15:49:27.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 131,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Khoa Công nghệ thông tin",
          MISACode: "/000/001/003/001/",
          ParentID: 31,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 2,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-18T15:48:02.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-18T15:48:02.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1117,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Khoa Kinh tế và Quản trị kinh doanh",
          MISACode: "/000/001/004/001/",
          ParentID: 32,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 2,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-02-27T02:47:13.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-02-27T09:47:13.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 6,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Quản trị",
          MISACode: "/000/000/000/002/",
          ParentID: 2,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 3,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-03-03T21:28:12.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-03-03T21:28:30.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 867,
          OrganizationUnitCode: null,
          OrganizationUnitName:
            "Vụ Thống kê Tổng hợp và Phổ biến thông tin thống kê",
          MISACode: "/000/000/002/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 3,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-29T09:26:31.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2020-12-29T09:26:31.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1279,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Thu thập và Quản lý dữ liệu hành chính",
          MISACode: "/000/000/014/002/",
          ParentID: 14,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 3,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-19T08:43:14.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-19T08:43:14.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1110,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Kỹ thuật và Quản trị hệ thống",
          MISACode: "/000/000/014/006/002/",
          ParentID: 1108,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 3,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-06T16:56:22.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-06T16:56:22.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 707,
          OrganizationUnitCode: null,
          OrganizationUnitName:
            "Trung tâm Đào tạo, bồi dưỡng và tư vấn thống kê",
          MISACode: "/000/001/000/002/",
          ParentID: 28,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 3,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-21T12:24:31.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2020-12-21T12:24:31.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 142,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Ban Trị sự",
          MISACode: "/000/001/001/002/",
          ParentID: 29,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 3,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-18T15:49:22.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-18T15:49:22.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 992,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Nhà xuất bản Thống kê",
          MISACode: "/000/001/002/",
          ParentID: 13,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 3,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-04T17:43:53.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-04T17:43:53.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1289,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Kinh doanh",
          MISACode: "/000/001/002/001/",
          ParentID: 992,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 3,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-02-04T02:01:50.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2021-02-04T02:01:50.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 132,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Khoa Ngoại ngữ",
          MISACode: "/000/001/003/002/",
          ParentID: 31,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 3,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-18T15:48:07.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-18T15:48:07.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1118,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Khoa Kế toán - Tài chính",
          MISACode: "/000/001/004/002/",
          ParentID: 32,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 3,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-02-27T02:44:26.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-02-27T09:44:26.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 5,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Tài vụ",
          MISACode: "/000/000/000/003/",
          ParentID: 2,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 4,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-03-03T21:28:12.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-03-03T21:28:21.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 25,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Hệ thống Tài khoản quốc gia",
          MISACode: "/000/000/003/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 4,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T15:06:03.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T15:06:03.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1277,
          OrganizationUnitCode: null,
          OrganizationUnitName:
            "Phòng Quản lý và Ứng dụng công nghệ thông tin thống kê",
          MISACode: "/000/000/014/003/",
          ParentID: 14,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 4,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-07-10T03:36:38.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-07-10T10:36:38.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 708,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Trung tâm Thông tin khoa học thống kê",
          MISACode: "/000/001/000/003/",
          ParentID: 28,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 4,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-21T12:24:31.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2020-12-21T12:24:31.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 993,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Tổ chức - Hành chính",
          MISACode: "/000/001/002/002/",
          ParentID: 992,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 4,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-04T17:43:53.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-04T17:43:53.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 31,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Trường Cao đẳng Thống kê",
          MISACode: "/000/001/003/",
          ParentID: 13,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 4,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T15:07:27.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T15:07:27.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 130,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Khoa Kinh tế và Quản trị kinh doanh",
          MISACode: "/000/001/003/003/",
          ParentID: 31,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 4,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-30T16:04:35.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-01-30T23:04:35.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1119,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Khoa Ngoại ngữ",
          MISACode: "/000/001/004/003/",
          ParentID: 32,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 4,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-06T16:56:23.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-06T16:56:23.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 7,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Quản lý xe",
          MISACode: "/000/000/000/004/",
          ParentID: 2,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 5,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-03-03T21:28:12.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-03-03T21:28:38.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 24,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Thống kê Nông Lâm nghiệp và Thủy sản",
          MISACode: "/000/000/004/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 5,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-14T01:18:28.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-01-14T08:19:42.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 989,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Trung tâm Tư vấn và Dịch vụ thống kê",
          MISACode: "/000/000/014/004/",
          ParentID: 14,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 5,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-04T12:40:02.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-01-04T19:40:02.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 709,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Tổ chức - Hành chính",
          MISACode: "/000/001/000/004/",
          ParentID: 28,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 5,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-31T15:05:46.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-01-31T22:05:46.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 134,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Khoa Cơ sở",
          MISACode: "/000/001/003/004/",
          ParentID: 31,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 5,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-30T16:11:24.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-01-30T23:11:24.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 32,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Trường Cao đẳng Thống kê II",
          MISACode: "/000/001/004/",
          ParentID: 13,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 5,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T15:07:40.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T15:07:40.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1120,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Trung tâm Tuyển sinh Hợp tác và Tư vấn",
          MISACode: "/000/001/004/004/",
          ParentID: 32,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 5,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-07-27T07:35:21.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-07-27T14:35:21.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 11,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Bảo vệ",
          MISACode: "/000/000/000/005/",
          ParentID: 2,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 6,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-11-19T10:45:05.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-11-19T10:45:05.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1112,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Thống kê Công nghiệp và Xây dựng",
          MISACode: "/000/000/005/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 6,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-06T16:56:22.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-06T16:56:22.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1102,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Trung tâm Tin học Thống kê khu vực I",
          MISACode: "/000/000/014/005/",
          ParentID: 14,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 6,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-02-01T14:46:01.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-02-01T14:47:21.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 129,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Khoa Kế toán Tài chính",
          MISACode: "/000/001/003/005/",
          ParentID: 31,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 6,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-02-01T08:54:20.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-02-01T08:56:16.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1114,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Quản lý đào tạo và Nghiên cứu khoa học",
          MISACode: "/000/001/004/005/",
          ParentID: 32,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 6,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-02-27T02:46:19.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-02-27T09:46:19.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 22,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Thống kê Thương mại và Dịch vụ",
          MISACode: "/000/000/006/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 7,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-14T10:59:56.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-01-14T17:59:56.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1108,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Trung tâm Tin học Thống kê Khu vực II",
          MISACode: "/000/000/014/006/",
          ParentID: 14,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 7,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-06T16:56:22.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-06T16:56:22.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 136,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Quản lý đào tạo và Nghiên cứu khoa học",
          MISACode: "/000/001/003/006/",
          ParentID: 31,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 7,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-30T16:26:06.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-01-30T23:26:06.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1113,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Tổ chức - Hành chính",
          MISACode: "/000/001/004/006/",
          ParentID: 32,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 7,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-06T16:56:22.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-06T16:56:22.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 21,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Thống kê Giá",
          MISACode: "/000/000/007/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 8,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T15:05:00.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T15:05:00.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1094,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Trung tâm Tin học Thống kê khu vực III",
          MISACode: "/000/000/014/007/",
          ParentID: 14,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 8,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-02-01T14:46:01.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-02-01T14:47:13.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 135,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Trung tâm Tuyển sinh Hợp tác và Tư vấn",
          MISACode: "/000/001/003/007/",
          ParentID: 31,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 8,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-06-08T10:01:01.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-06-08T17:01:01.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1115,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Tài vụ",
          MISACode: "/000/001/004/007/",
          ParentID: 32,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 8,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-06T16:56:23.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-06T16:56:23.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1216,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Thống kê Dân số và Lao động",
          MISACode: "/000/000/008/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 9,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-09T08:20:36.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-09T08:20:36.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 140,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Tổ chức Hành chính",
          MISACode: "/000/001/003/008/",
          ParentID: 31,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 9,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-30T16:32:48.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-01-30T23:32:48.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1262,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Thống kê Xã hội và Môi trường",
          MISACode: "/000/000/009/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 10,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-11T08:48:50.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-11T08:48:50.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 138,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Tài vụ",
          MISACode: "/000/001/003/009/",
          ParentID: 31,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 10,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-18T15:48:41.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-18T15:48:41.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 18,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Thống kê nước ngoài và Hợp tác quốc tế",
          MISACode: "/000/000/010/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 11,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T15:04:18.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T15:04:18.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 17,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Tổ chức cán bộ",
          MISACode: "/000/000/011/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 12,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T15:04:03.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T15:04:03.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1190,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Kế hoạch tài chính",
          MISACode: "/000/000/012/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 13,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-08T08:27:48.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-08T08:27:48.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1164,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Vụ Pháp chế và Thanh tra thống kê",
          MISACode: "/000/000/013/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 14,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-07T06:43:31.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-01-07T13:43:31.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 14,
          OrganizationUnitCode: null,
          OrganizationUnitName:
            "Cục Thu thập dữ liệu và Ứng dụng công nghệ thông tin thống kê",
          MISACode: "/000/000/014/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 15,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T15:01:38.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T15:01:38.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1332,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Văn phòng Đảng ủy",
          MISACode: "/000/000/015/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 16,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-03-02T10:20:55.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2021-03-02T10:20:55.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1333,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Văn phòng Công đoàn",
          MISACode: "/000/000/016/",
          ParentID: 12,
          Inactive: false,
          IsDeleted: false,
          SortOrder: 17,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-03-02T10:21:04.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2021-03-02T10:21:04.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Tổng cục Thống Kê",
          MISACode: "/000/",
          ParentID: null,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-10-14T00:00:00.000+07:00",
          CreatedBy: "admin",
          ModifiedDate: "2020-10-21T18:48:26.000+07:00",
          ModifiedBy: "admin",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 12,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Các đơn vị thuộc cơ quan Tổng cục",
          MISACode: "/000/000/",
          ParentID: 1,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T14:59:59.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T14:59:59.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 990,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Hành chính - Thư viện",
          MISACode: "/000/000/014/004/000/",
          ParentID: 989,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-04T17:43:53.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-04T17:43:53.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 991,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Dịch vụ",
          MISACode: "/000/000/014/004/001/",
          ParentID: 989,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-01-04T17:43:53.000+07:00",
          CreatedBy: "Admin_Import",
          ModifiedDate: "2021-01-04T17:43:53.000+07:00",
          ModifiedBy: "Admin_Import",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1103,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Hành chính - Tổng hợp",
          MISACode: "/000/000/014/005/000/",
          ParentID: 1102,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-07-07T04:42:04.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-07-07T11:42:04.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1104,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Phát triển ứng dụng",
          MISACode: "/000/000/014/005/001/",
          ParentID: 1102,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-07-07T04:42:14.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-07-07T11:42:14.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1106,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Kỹ thuật và Quản trị hệ thống",
          MISACode: "/000/000/014/005/002/",
          ParentID: 1102,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-07-07T11:42:18.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-07-07T11:42:26.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1095,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Hành chính - Tổng hợp",
          MISACode: "/000/000/014/007/000/",
          ParentID: 1094,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-07-07T04:41:51.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-07-07T11:41:51.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1096,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Phát triển ứng dụng",
          MISACode: "/000/000/014/007/001/",
          ParentID: 1094,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-07-07T04:43:01.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-07-07T11:43:01.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 1097,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Phòng Kỹ thuật và Quản trị hệ thống",
          MISACode: "/000/000/014/007/002/",
          ParentID: 1094,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: false,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2021-07-07T04:43:42.000+07:00",
          CreatedBy: null,
          ModifiedDate: "2021-07-07T11:43:42.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
        {
          OrganizationUnitID: 13,
          OrganizationUnitCode: null,
          OrganizationUnitName: "Các đơn vị trực thuộc Tổng cục",
          MISACode: "/000/001/",
          ParentID: 1,
          Inactive: false,
          IsDeleted: false,
          SortOrder: null,
          IsParent: true,
          TenantID: "4b4306dd-3644-4519-92cc-30f2eb614ef0",
          CreatedDate: "2020-12-17T15:00:34.000+07:00",
          CreatedBy: "",
          ModifiedDate: "2020-12-17T15:00:58.000+07:00",
          ModifiedBy: "",
          EditVersion: null,
          State: 0,
          OldData: null,
          PassWarningCode: null,
        },
      ],
      treeBoxValue: null,
      gridDataSource: null,
      isTreeBoxOpened: false,
      treeViewRefName: "tree-view",
      MISACode: "",
      event: "",
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
     * Xét check/ bỏ check thêm các thành viên trong nhóm
     * Author: TNDanh (31/8/2022)
     */
    onSelectionChanged(data) {
      // 1. Thêm memberID mới
      if (
        data.currentDeselectedRowKeys.length === 0 &&
        data.currentSelectedRowKeys.length === 1
      ) {
        this.membersWillAdd.push(data.currentSelectedRowKeys[0]);
      }
      // 2. Loại memberID đi
      if (
        data.currentDeselectedRowKeys.length === 1 &&
        data.currentSelectedRowKeys.length === 0
      ) {
        this.membersWillAdd = this.membersWillAdd.filter(
          (memberID) => memberID !== data.currentDeselectedRowKeys[0]
        );
      }
    },
    /**
     * Lấy users mới
     * Author: TNDanh (7/9/2022)
     */
    async handleGetUsers() {
      this.isLoading = true;
      await this.$store.dispatch("getUsers", this.pageDetail);
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
      const me = this;
      // Kiểm tra xem ô nhập liệu đã nhập giá trị chưa ?
      if (value) {
        this.pageDetail.searchWord = value;
        clearTimeout(me.event);
        me.event = setTimeout(() => {
          me.handleEnterKeyWhenSearch();
        }, 500);
      }
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
      this.controlHeight = document.querySelector(
        ".popup-add-member__main .control"
      ).offsetHeight;
    },
    /**
     * Xử lý khi lưu các member được thêm vào
     * Author: TNDanh (12/9/2022)
     */
    async handleSaveMemberForUserGroup() {
      await this.$store.dispatch("addMembersForUserGroup", {
        userGroupID: this.userGroupCurrent.UserGroupID,
        memberIDs: this.membersWillAdd,
      });
      this.$emit("saveMemberForUserGroup");
    },
    /**
     * Bỏ check các phần tử đang check
     * Author: TNDanh (12/9/2022)
     */
    handleUnchecked() {
      this.membersWillAdd = [];
    },
    /**
     * Lấy ra id của người dùng là thành viên của nhóm người dùng
     * Author: TNDanh (22/9/2022)
     */
    memberOfUserGroupInUsersData() {
      this.membersWillAdd = this.userGroupCurrent?.Members.map((member) => {
        return member.MemberID;
      });
      //return this.users.map((user) => memberIDs.includes(user.UserID));
    },
    /* Các hàm xử lý cây đơn vị  */
    syncTreeViewSelection() {
      if (!this.$refs[this.textBoxRefName]) return;
      if (!this.treeBoxValue) {
        this.$refs[this.textBoxRefName].instance.unselectAll();
      } else {
        this.$refs[this.textBoxRefName].instance.selectItem(this.treeBoxValue);
      }
    },
    treeView_itemSelectionChanged(e) {
      this.treeBoxValue = e.component.getSelectedNodeKeys();
      this.MISACode = e.itemData.MISACode;
    },
    onTreeItemClick() {
      this.isTreeBoxOpened = false;
    },
  },
  computed: {
    showPropertiesNeed() {
      return this.userPropertiesEnum.filter((property, index) => index <= 4);
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
    // this.memberOfUserGroupInUsersData();
  },
  watch: {
    users: {
      handler() {
        this.isLoading = false;
      },
      deep: true,
    },
    userGroupCurrent: {
      handler() {
        this.membersWillAdd = this.userGroupCurrent?.Members.map((member) => {
          return member.MemberID;
        });
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
  margin-top: 10px;
  /* max-height: calc(100% - 94px); */
  height: calc(100% - 112px);
  overflow: hidden;
}

.popup-add-member__main .body__footer {
  position: absolute;
  content: "";
  bottom: 5px;
  right: 24px;
  left: 24px;
}

.popup-add-member__main .body__main {
  height: 100%;
  /* overflow: auto; */
}

.popup-add-member__main .body__main.body-collapse {
  height: calc(100% - 51px);
}

.popup-add-member__main .body__content {
  margin-top: 16px;
  margin-bottom: 16px;
  display: none;
}

.popup-add-member__main .body__content.show {
  display: block;
}

.popup-add-member__main .body.body-collapse {
  height: calc(100% - 165px);
}

.popup-add-member__main .body__content .select {
}

.popup-add-member__main .body__content .unchecked {
  color: var(--primary);
  margin-left: 24px;
  cursor: pointer;
}

.popup-add-member__main .control__search {
  height: 38px;
}

.popup-add-member__main .control__tagbox {
  /* height: 38px; */
  min-height: 38px !important;
  max-height: 102px !important;
  overflow-y: auto;
  padding-left: 28px;
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

.control .job-position {
  align-items: center;
  position: relative;
}

.job-title-position {
  position: absolute;
  content: "";
  top: 7px;
  left: 6px;
  width: 24px;
  height: 24px;
  mask: url("../../assets/Icons/ic_sprites.svg") no-repeat -574px -21px;
  background-color: #65696e;
  z-index: 1;
}

.organization-unit-tree {
  position: relative;
}

.organization-unit-tree__icon {
  position: absolute;
  content: "";
  top: 6px;
  left: 10px;
  width: 24px;
  height: 24px;
  mask: url("../../assets/Icons/ic_sprites.svg") no-repeat -550px -22px;
  background-color: #65696e;
  z-index: 1;
}

.organization-unit-tree__main {
  padding-left: 30px;
}
</style>