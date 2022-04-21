<template>
  <div id="main">
    <mavon-editor
      v-model="value"
      :toolbars="toolbars"
      :defaultOpen="preview"
      :subfield="subfield"
    >
      <template slot="right-toolbar-after">
        <button
          type="button"
          @click="changePreview"
          class="op-icon fa fa-eye"
          aria-hidden="true"
          title="预览"
        ></button>
      </template>
      <template slot="right-toolbar-after">
        <button
          type="button"
          @click="openHelp"
          class="op-icon fa fa-question-circle"
          aria-hidden="true"
          :title="moreTitle"
        ></button>
      </template>
    </mavon-editor>
    <mavon-editor
      v-model="helpValue"
      :toolbarsFlag="false"
      :editable="false"
      :subfield="false"
      defaultOpen="preview"
      style="margin-top: 20px"
    />
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    return {
      value: "$$\n这里输入公式\n$$",
      helpValue: "",
      preview: "preview",
      subfield: true,
      showMore: false,
      moreTitle: "查看更多符号",
      toolbars: {},
    };
  },
  mounted() {
    this.helpValue = this.getTxt("static/simpleHelp.txt");
  },
  methods: {
    getTxt(path) {
      let xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
      xhr.open("GET", path, false); 
      xhr.overrideMimeType("text/html;charset=utf-8"); 
      xhr.send(null);
      return xhr.responseText;
    },
    changePreview() {
      this.subfield = !this.subfield;
    },
    openHelp() {
      if (this.showMore) {
        this.helpValue = this.getTxt("static/simpleHelp.txt");
        this.moreTitle = "查看更多符号";
        this.showMore = false;
      } else {
        this.helpValue = this.getTxt("static/help.txt");
        this.moreTitle = "查看常用符号";
        this.showMore = true;
      }
    },
  },
};
</script>
