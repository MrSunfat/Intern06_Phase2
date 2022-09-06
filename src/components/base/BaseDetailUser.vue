<template>
  <div class="detail-preview-user">
    <div class="icon-size close d-f" @click="handleHideDetailUser">
      <div class="icon-title-size"></div>
    </div>
    <div class="detail-preview-user__header mg-b-24 d-f">
      <div class="header__avatar mg-r-8">
        <img :src="avatarImg" alt="avatar" class="header__avatar__img" />
      </div>
      <div class="header__detail">
        <h1 class="full-name no-mg font-20 text-default-color">
          Nguyễn Gia Anh
        </h1>
        <div class="email font-14 text-default-color">
          qlhoinghi@tctk.misa.vn
        </div>
        <div class="status-work">
          <BaseTagStatus
            :content="statusTagEnum.Content.Work"
            :dot="statusTagEnum.Dot.Show"
            type="on"
          />
        </div>
        <BaseButton
          class="edit-user-group-btn"
          :type="buttomEnum.typeBtn.Text"
          :nameBtn="buttomEnum.nameBtn.EditUserGroup"
          @click="handleShowPopupUserGroup"
        />
      </div>
    </div>
    <div class="detail-preview-user__body">
      <div class="detail-work__title semi-bold text-default-color font-16">
        Thông tin công việc
      </div>
      <div class="detail-row d-f font-14">
        <div class="detail-row__title">Chức vụ</div>
        <div class="detail-row__content">Tổng Cục trưởng</div>
      </div>
      <div class="detail-row d-f">
        <div class="detail-row__title">Phòng ban</div>
        <div class="detail-row__content">Tổng Cục trưởng</div>
      </div>
      <div class="detail-row d-f">
        <div class="detail-row__title">Đơn vị công tác</div>
        <div class="detail-row__content">Tổng Cục trưởng</div>
      </div>
      <div class="detail-row d-f">
        <div class="detail-row__title">Số điện thoại</div>
        <div class="detail-row__content">Tổng Cục trưởng</div>
      </div>
      <div class="detail-row d-f">
        <div class="detail-row__title">SĐT cơ quan</div>
        <div class="detail-row__content">Tổng Cục trưởng</div>
      </div>
      <div class="detail-work__title semi-bold text-default-color font-16">
        Thuộc nhóm
      </div>
      <div class="detail-usergroup">
        <div class="detail-usergroup__title font-14 bold">Nhóm người dùng</div>
        <div class="detail-usergroup__item">
          Cán bộ thuộc đơn vị hành chính (trừ Cục Thu thập)
        </div>
        <div class="detail-usergroup__item">
          Lãnh đạo Tổng cục phê duyệt đề nghị công tác
        </div>
        <div class="detail-usergroup__item">Tiếp nhận đề nghị đi công tác</div>
      </div>
    </div>
  </div>
</template>

<script>
import { statusTagEnum, buttomEnum } from "@/scripts/enum";
import BaseTagStatus from "@/components/base/BaseTagStatus.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import avatarImg from "@/assets/Icons/avatar.png";
export default {
  name: "BaseDetailUser",
  components: {
    BaseTagStatus,
    BaseButton,
  },
  data() {
    return {
      statusTagEnum,
      buttomEnum,
      avatarImg,
    };
  },
  methods: {
    /**
     * Gửi một sự kiện -> tắt DetailUser
     * Author: TNDanh (27/8/2022)
     */
    handleHideDetailUser() {
      this.$emit("hiddenDetailUser");
    },
    /**
     * Mở popup chỉnh sửa nhóm
     * Author: TNDanh (27/8/2022)
     */
    handleShowPopupUserGroup() {
      this.$emit("showPopupUserGroup");
    },
  },
};
</script>

<style scoped>
.detail-preview-user {
  height: 100%;
  position: relative;
  padding: 24px;
}
.detail-preview-user .content-user {
}

.detail-preview-user .close {
  position: absolute;
  top: 24px;
  right: 24px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  z-index: 2;
}

.detail-preview-user .close:hover {
  background-color: var(--icon-default-hover-bg);
}

.detail-preview-user .icon-title-size {
  mask: url("../../assets/Icons/ic_sprites_2.svg") no-repeat -217px -24px;
  background-color: var(--icon-default-color);
}

/* Header của preview user */
.detail-preview-user__header {
}

.detail-preview-user__header .header__avatar {
  width: 95px;
  height: 119px;
  /* background: #000; */
}

.detail-preview-user__header .header__avatar__img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  margin-top: 10px;
}

.detail-work__title {
  font-weight: 500;
  text-transform: uppercase;
  margin: 20px 0;
}

.detail-row {
  height: var(--detail-row-height);
  align-items: center;
  color: var(--text-color);
  margin-bottom: 16px;
}

.detail-row__title {
  min-width: 108px;
  width: 165px;
}

.detail-row__content {
  height: 100%;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--detail-row-border-color);
  width: 284px;
}

.detail-usergroup__title,
.detail-usergroup__item {
  padding: 0 16px;
  height: var(--row-height);
  display: flex;
  align-items: center;
}

.detail-usergroup__item {
  cursor: pointer;
  color: var(--title-color);
  background-color: var();
  border-top: 1px solid var(--detail-row-border-color);
}

.detail-usergroup__item:hover {
  background-color: var(--hover-bg);
}

.detail-usergroup__item:last-child {
  border-bottom: 1px solid var(--detail-row-border-color);
}
</style>