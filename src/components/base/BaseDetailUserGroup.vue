<template>
  <div class="detail-preview-user-group">
    <div
      class="icon-size close icon-size-hover-bg d-f"
      @click="handleHideDetailUserGroup"
    >
      <div class="icon-title-size"></div>
    </div>
    <div class="detail-preview-user-group__header">
      <div class="header__top">
        <h1 class="user-group-name no-mg font-20 bold">
          Lãnh đạo đơn vị phê duyệt đề nghị công tác
        </h1>
        <BaseTagStatus
          class="tag no-mg bolder-text"
          :content="statusTagEnum.Content.Use"
          :dot="statusTagEnum.Dot.Show"
          type="on"
        />
      </div>
      <div class="header__bottom mg-t-16">
        <span class="description">
          Nhóm gồm các Thủ trưởng đơn vị (Vụ trưởng/Viện trưởng/...) thuộc Tổng
          cục tham gia phê duyệt đề nghị đi công tác
        </span>
      </div>
    </div>
    <div class="detail-preview-user-group__body">
      <div class="title bold mg-b-12">
        Thành viên&nbsp;<span class="bold">(4)</span>
      </div>
      <div class="d-f control mg-b-14">
        <BaseInputSearch :placeholderText="placholderText.InputMember" />
        <BaseButton
          :nameBtn="buttomEnum.nameBtn.AddMember"
          :type="buttomEnum.typeBtn.Primary"
          positionIcon="-237px 0px"
          @click="handleShowPopupAddMember"
        />
      </div>
      <div class="control-plus" v-show="selectedMemberNumber">
        <span class="selected-mem mg-r-16">
          {{ selectedMemberNumber }} đang chọn
        </span>
        <p class="unchecked mg-r-16" @click="handleUnCheckAll">
          {{ buttomEnum.nameBtn.UnChecked }}
        </p>
        <BaseButton
          :nameBtn="buttomEnum.nameBtn.RemoveMember"
          :type="buttomEnum.typeBtn.Warn"
        />
      </div>
      <div class="container">
        <div
          class="member"
          v-for="member in userFromGroup"
          :key="member.UserID"
        >
          <DxCheckBox v-model="member.Check" class="input-checkbox mg-r-14" />
          <div class="member__content">
            <div class="avatar mg-r-14">
              <img :src="avatarImg" alt="avatar" class="avatar__img" />
            </div>
            <div class="member__detail">
              <div class="full-name">
                {{ member.UserName }}&nbsp;<span>({{ member.Email }})</span>
              </div>
              <div class="position">
                {{ member.Position }} - {{ member.Offical }}
              </div>
            </div>
          </div>
          <div class="icon-size delete-member">
            <div class="icon-title-size"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { statusTagEnum, buttomEnum } from "@/scripts/enum";
import { placholderText } from "@/scripts/constants";
import BaseTagStatus from "@/components/base/BaseTagStatus.vue";
import BaseInputSearch from "@/components/base/BaseInputSearch.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { DxCheckBox } from "devextreme-vue/check-box";
import avatarImg from "@/assets/Icons/avatar.png";

export default {
  name: "BaseDetailUserGroup",
  components: {
    BaseTagStatus,
    BaseInputSearch,
    BaseButton,
    DxCheckBox,
  },
  data() {
    return {
      placholderText,
      statusTagEnum,
      buttomEnum,
      userFromGroup: [
        {
          UserID: 1,
          UserName: "Đinh Bảo Ngọc",
          Email: "user12@tctk.misa.vn",
          Position: "Tổng Cục trưởng",
          Offical: "Tổng cục Thống Kê",
        },
        {
          UserID: 2,
          UserName: "Đinh Bảo Ngọc",
          Email: "user12@tctk.misa.vn",
          Position: "Tổng Cục trưởng",
          Offical: "Tổng cục Thống Kê",
        },
        {
          UserID: 3,
          UserName: "Đinh Bảo Ngọc",
          Email: "user12@tctk.misa.vn",
          Position: "Tổng Cục trưởng",
          Offical: "Tổng cục Thống Kê",
        },
      ],
      selectedMemberNumber: 0,
      avatarImg,
    };
  },
  methods: {
    /**
     * Tạo sự kiện đóng DetailUserGroup
     * Author: TNDanh (28/8/2022)
     */
    handleHideDetailUserGroup() {
      this.$emit("hideDetailUserGroup");
    },
    /**
     * Tạo sự kiện mở Popup Add Member
     * Author: TNDanh (29/8/2022)
     */
    handleShowPopupAddMember() {
      this.$emit("showPopupAddMember");
    },
    /**
     * Xử lý bỏ check toàn bộ member
     * Author: TNDanh (29/8/2022)
     */
    handleUnCheckAll() {
      // 1. Bỏ check toàn bộ member
      this.handleInitUserWithChekbox();

      // Xét số member đang chọn là 0
      this.selectedMemberNumber = 0;
    },
    /**
     * Khởi tạo user kèm checkbox
     * Author: TNDanh (29/8/2022)
     */
    handleInitUserWithChekbox() {
      this.userFromGroup = this.userFromGroup.map((user) => ({
        ...user,
        Check: false,
      }));
    },
  },
  created() {
    this.handleInitUserWithChekbox();
  },
  watch: {
    userFromGroup: {
      handler() {
        // 2. Đếm số lượng member đang chọn
        this.selectedMemberNumber = this.userFromGroup.filter(
          (user) => user.Check
        ).length;
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.detail-preview-user-group {
  position: relative;
  padding: 24px;
  height: 100%;
}

.detail-preview-user-group .close {
  position: absolute;
  content: "";
  top: 24px;
  right: 24px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.detail-preview-user-group .close > .icon-title-size {
  mask: url("../../assets/Icons/ic_sprites_2.svg") no-repeat -216px -24px;
  background-color: var(--icon-default-color);
}

.detail-preview-user-group .tag {
  margin-left: 8px;
}

/* --header-- */
.detail-preview-user-group__header {
  border-bottom: 1px solid var(--detail-row-border-color);
}
.detail-preview-user-group__header .header__top {
  display: flex;
  align-items: center;
}

.detail-preview-user-group__header .header__bottom {
  margin-top: 16px;
  margin-bottom: 40px;
}

/* control */
.detail-preview-user-group__body .control {
  justify-content: space-between;
}

/* control plus */
.detail-preview-user-group__body .control-plus {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  /* justify-content: space-between; */
}

.detail-preview-user-group__body .control-plus .unchecked {
  color: var(--primary);
  cursor: pointer;
}

/* --body-- */
.detail-preview-user-group__body {
  margin-top: 24px;
}

.detail-preview-user-group__body .container .member {
  position: relative;
  height: 64px;
  display: flex;
  align-items: center;
}

.detail-preview-user-group__body .container .member > .delete-member {
  position: absolute;
  right: 0;
  height: 64px;
  display: none;
  align-items: center;
  cursor: pointer;
}

.detail-preview-user-group__body
  .container
  .member
  > .delete-member
  .icon-title-size {
  mask: url("../../assets/Icons/ic_sprites_2.svg") no-repeat -171px -26px;
  background-color: var(--delete-icon-color);
}

.detail-preview-user-group__body .container .member:hover {
  background-color: var(--active-option-dropbox-bg);
}

.detail-preview-user-group__body .container .member:hover .delete-member {
  display: flex;
}

.detail-preview-user-group__body .container .member {
}

.detail-preview-user-group__body .container .member__content {
  display: flex;
}

.detail-preview-user-group__body .container .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--detail-row-border-color);
}

.detail-preview-user-group__body .container .avatar__img {
  width: 100%;
  height: 100%;
}
</style>