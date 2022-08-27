<template>
  <div class="pagination d-f">
    <div class="footer__left d-f mg-l-16 font-14">
      Tổng số:&nbsp;
      <h1 class="no-mg total-record bold font-14">24</h1>
      &nbsp;bản ghi
    </div>
    <div class="footer__right d-f">
      <div class="footer__right__container d-f">
        <span class="title mg-r-8">Số bản ghi/trang</span>
        <DxSelectBox
          class="page-size w-80"
          :items="currentRecord"
          placeholder="50"
        />
        <span class="current__record d-f font-14">
          <h1 class="title no-mg font-14 bold">1-24</h1>
          &nbsp;bản ghi
        </span>
      </div>
      <div class="page-next-preview d-f mg-r-16">
        <BaseButton
          :type="buttomEnum.typeBtn.IconSpecial"
          positionIcon="-73px -24px"
          @click="handlePrevPage"
        />
        <BaseButton
          :type="buttomEnum.typeBtn.IconSpecial"
          positionIcon="-96px -24px"
          @click="handlNextPage"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { buttomEnum, currentRecord } from "@/scripts/enum";
import DxSelectBox from "devextreme-vue/select-box";
import BaseButton from "@/components/base/BaseButton.vue";
export default {
  name: "BasePagination",
  props: {
    totalPage: {
      type: Number,
    },
  },
  components: {
    DxSelectBox,
    BaseButton,
  },
  data() {
    return {
      buttomEnum,
      currentRecord,
      idxPage: 1,
    };
  },
  methods: {
    /**
     * Xử lý khi nhấn chuyển trang trước đó
     * Author: TNDanh (27/8/2022)
     */
    handlePrevPage() {
      console.log("prev");
      if (this.idxPage - 1 > 1) {
        this.$emit("prevPage", this.idxPage - 1);
      } else {
        this.$emit("offPrevPage");
      }
    },
    /**
     * Xử lý khi nhấn chuyển về trang tiếp theo
     * Author: TNDanh (27/8/2022)
     */
    handlNextPage() {
      console.log("next");

      if (this.idxPage + 1 <= this.totalPage) {
        this.$emit("nextPage", this.idxPage + 1);
      } else {
        this.$emit("offNextPage");
      }
    },
  },
};
</script>

<style scoped>
.pagination {
  height: var(--footer-height);
  background: var(--primary-bg);
  border-radius: 8px;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
/* Footer phải của user */
.footer__right__container {
  align-items: center;
}

.current__record {
  padding: 0 24px;
}

.page-next-preview {
  align-items: center;
}
</style>