<template>
  <el-container class="main-container">
    <el-header height="50px" class="app-header">
      <div class="brand">
        <i class="fa fa-cube" style="margin-right: 8px; color: #409EFF;"></i>
        <span>Fast Formula</span>
      </div>
      <div class="header-actions">
        <el-tooltip content="View saved formulas" placement="bottom">
          <el-button size="small" icon="el-icon-folder-opened" circle @click="listDrawerVisible = true"></el-button>
        </el-tooltip>
        <el-tooltip content="Save current formula" placement="bottom">
          <el-button size="small" type="primary" icon="el-icon-check" circle @click="saveDialogVisible = true"></el-button>
        </el-tooltip>
        <el-tooltip content="Help & Documentation" placement="bottom">
          <el-button size="small" icon="el-icon-question" circle @click="helpDrawerVisible = true"></el-button>
        </el-tooltip>
      </div>
    </el-header>

    <el-main class="editor-main">
      <mavon-editor
        v-model="formulaValue"
        :toolbars="toolbars"
        defaultOpen="preview"
        :subfield="subfield"
        ref="md"
        id="math"
        style="height: 100%; width: 100%;"
        :boxShadow="false"
      >
        <template slot="right-toolbar-before">
          <button
            type="button"
            @click="copy('mathml')"
            class="op-icon fa fa-clipboard"
            aria-hidden="true"
            title="Copy MathML (Word)"
          ></button>
          <button
            type="button"
            @click="copy('latex')"
            class="op-icon fa fa-files-o"
            aria-hidden="true"
            title="Copy LaTeX"
          ></button>
        </template>
        
        <template slot="right-toolbar-after">
          <button
            type="button"
            @click="changePreview"
            class="op-icon fa fa-eye"
            aria-hidden="true"
            title="Toggle Preview"
          ></button>
        </template>

        <template slot="left-toolbar-after"> | </template>
        <template slot="left-toolbar-after">
          <button
            v-for="item in hotKeyList"
            :key="item.id"
            type="button"
            @click="setValue(item.name)"
            class="op-icon custom-icon"
            aria-hidden="true"
            :title="item.title"
          >{{ item.title }}
          </button>
        </template>
      </mavon-editor>
    </el-main>

    <!-- Save Dialog -->
    <el-dialog title="Save Formula" :visible.sync="saveDialogVisible" width="400px" append-to-body>
      <el-input v-model="formulaName" placeholder="Enter formula name" prefix-icon="el-icon-edit"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveDialogVisible = false" size="small">Cancel</el-button>
        <el-button type="primary" @click="Save" size="small">Save</el-button>
      </span>
    </el-dialog>

    <!-- My Formulas Drawer -->
    <el-drawer
      title="My Formulas"
      :visible.sync="listDrawerVisible"
      direction="ltr"
      size="350px"
      append-to-body
      custom-class="formula-drawer"
    >
      <div class="drawer-content">
        <div class="search-box">
          <el-input
            v-model="searchInput"
            placeholder="Search formulas..."
            size="small"
            clearable
            prefix-icon="el-icon-search"
            @input="search"
          >
          </el-input>
        </div>

        <div class="formula-list">
          <el-empty v-if="tableData.length === 0" description="No saved formulas"></el-empty>
          <div v-for="(item, index) in tableData" :key="index" class="formula-card">
            <div class="card-header">
              <span class="formula-title">{{ item.formulaName }}</span>
              <div class="card-actions">
                <el-button type="text" size="mini" icon="el-icon-edit" @click="editFormula(item)"></el-button>
                <el-button type="text" size="mini" icon="el-icon-delete" class="delete-btn" @click="deleteFormula(item)"></el-button>
              </div>
            </div>
            <div class="card-preview">
               <mavon-editor
                  :value="item.formula"
                  :toolbarsFlag="false"
                  :editable="false"
                  :subfield="false"
                  defaultOpen="preview"
                  :boxShadow="false"
                  style="min-height: 60px; border: 1px solid #eee;"
               />
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- Help Drawer -->
    <el-drawer
      :title="moreTitle"
      :visible.sync="helpDrawerVisible"
      direction="rtl"
      size="500px"
      append-to-body
    >
      <div style="padding: 0 20px 20px; height: 100%; display: flex; flex-direction: column;">
        <div style="margin-bottom: 10px; text-align: right;">
           <el-switch
            v-model="showMore"
            active-text="Advanced Symbols"
            inactive-text="Basic"
            @change="openHelp">
          </el-switch>
        </div>
        <mavon-editor
          v-model="helpValue"
          :toolbarsFlag="false"
          :editable="false"
          :subfield="false"
          defaultOpen="preview"
          :boxShadow="false"
          style="flex: 1; border: 1px solid #eee;"
        />
      </div>
    </el-drawer>

  </el-container>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
      formulaValue: "$$\n这里输入公式\n$$", // 编辑公式的LaTex原字符串
      helpValue: "", // 帮助文档的内容
      subfield: true, // 是否展示预览
      showMore: false, // 是否显示更多帮助文档
      moreTitle: "Help & Symbols", // 标题
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: false, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true, // 预览
      }, 
      saveDialogVisible: false, 
      listDrawerVisible: false,
      helpDrawerVisible: false,
      formulaName: "", 
      tableData: [], 
      searchInput: "", 
      hotKeyList: [
        { id: 1, name: "sum", title: "求和" },
        { id: 2, name: "frac", title: "分式" },
        { id: 3, name: "lim", title: "极限" },
        { id: 4, name: "partial", title: "微分" },
        { id: 5, name: "∞", title: "∞" },
        { id: 6, name: "α", title: "α" },
        { id: 7, name: "β", title: "β" },
        { id: 8, name: "ω", title: "ω" },
        { id: 9, name: "θ", title: "θ" },
        { id: 10, name: "λ", title: "λ" },
        { id: 11, name: "μ", title: "μ" },
        { id: 12, name: "σ", title: "σ" },
      ],
    };
  },
  watch: {
    formulaValue(newVal, oldVal) {
      if (
        newVal.substring(0, 2) != "$$" ||
        newVal.substring(newVal.length - 2, newVal.length) != "$$"
      ) {
        this.$notify({
          title: "Warning",
          message: "Please keep the surrounding '$$' tags",
          type: 'warning',
          duration: 2000
        });
      }
    },
  },
  mounted() {
    this.helpValue = this.getTxt("static/simpleHelp.txt");
    this.loadSavedFormula();
  },
  methods: {
    toMathML(jax, callback) {
      var mml;
      try {
        mml = jax.root.toMathML("");
      } catch (err) {
        if (!err.restart) {
          throw err;
        }
        return MathJax.Callback.After([toMathML, jax, callback], err.restart);
      }
      MathJax.Callback(callback)(mml);
    },
    copy(type) {
      var _this = this;
      if (type == "mathml") {
        MathJax.Hub.Config({
          tex2jax: {
            inlineMath: [
              ["$", "$"],
              ["\\\\(", "\\\\)"],
            ],
          },
        });
        let math = document.getElementById("math");
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);

        MathJax.Hub.Queue(function () {
          var jax = MathJax.Hub.getAllJax();

          _this.toMathML(jax[0], function (mml) {
            _this.$copyText(mml).then(
              function (e) {
                _this.$message({
                  message: "MathML copied! Paste into Word.",
                  type: "success",
                });
              },
              function (e) {
                _this.$message({
                  message: "Copy failed",
                  type: "error",
                });
              }
            );
          });
        });
      } else {
        this.$copyText(this.formulaValue).then(
          function (e) {
            _this.$message({
              message: "LaTeX copied!",
              type: "success",
            });
          },
          function (e) {
            _this.$message({
              message: "Copy failed",
              type: "error",
            });
          }
        );
      }
    },
    setValue(value) {
      let insertVal = "";
      switch (value) {
        case "sum": insertVal = "\\sum_{x}^{s}{A}"; break;
        case "frac": insertVal = "\\frac{a}{b}"; break;
        case "lim": insertVal = "\\lim_{x \\to 0}{x}"; break;
        case "partial": insertVal = "\\partial{x}"; break;
        case "int": insertVal = "\\int^{\\infty}_{0}{xdx}"; break;
        case "∞": insertVal = "\\infty"; break;
        case "α": insertVal = "\\alpha"; break;
        case "β": insertVal = "\\beta"; break;
        case "ω": insertVal = "\\omega"; break;
        case "θ": insertVal = "\\theta"; break;
        case "λ": insertVal = "\\lambda"; break;
        case "μ": insertVal = "\\mu"; break;
        case "σ": insertVal = "\\sigma"; break;
      }

      const $vm = this.$refs.md;
      $vm.insertText($vm.getTextareaDom(), {
        prefix: insertVal,
        subfix: "",
        str: "",
      });
    },
    search() {
      if (this.searchInput == "") {
        this.loadSavedFormula();
      } else {
        this.$db.find({ formulaName:  new RegExp(this.searchInput) }, (err, docs) => {
           if (err) return;
           this.updateTableData(docs);
        });
      }
    },
    loadSavedFormula() {
      this.$db.find({}, (err, docs) => {
        if (err) {
          console.log(err);
          return;
        }
        this.updateTableData(docs);
      });
    },
    updateTableData(docs) {
       this.tableData = docs.map(d => ({
         formulaName: d.formulaName,
         formula: d.formula
       })).reverse(); // Show newest first
    },
    deleteFormula(row) {
      this.$confirm('Are you sure you want to delete this formula?', 'Warning', {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          this.deleteData(row.formulaName);
          this.loadSavedFormula();
          this.$message({
            message: "Deleted",
            type: "success",
          });
        }).catch(() => {});
    },
    editFormula(row) {
      this.formulaValue = row.formula;
      this.formulaName = row.formulaName;
      this.listDrawerVisible = false;
    },
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
      if (!this.showMore) {
        this.helpValue = this.getTxt("static/simpleHelp.txt");
        // this.moreTitle = "Help & Symbols";
      } else {
        this.helpValue = this.getTxt("static/help.txt");
        // this.moreTitle = "Help & Symbols";
      }
    },
    insertData(name, data) {
      this.$db.insert(
        { formulaName: name, formula: data },
        function (err, doc) {
          if (err) console.log(err);
        }
      );
    },
    updateData(name, data) {
      this.$db.update(
        { formulaName: name },
        { $set: { formula: data } },
        function (err, data) {
          if (err) console.log(err);
        }
      );
    },
    deleteData(name) {
      this.$db.remove({ formulaName: name }, {}, function (err, data) {
        if (err) console.log(err);
      });
    },
    Save() {
      if (this.formulaName != "" && this.formulaValue != "") {
        this.$db.find({ formulaName: this.formulaName }, (err, docs) => {
          if (err) {
            console.log(err);
            return;
          }
          if (docs.length == 0) {
            this.insertData(this.formulaName, this.formulaValue);
            this.loadSavedFormula();
            this.saveDialogVisible = false;
            this.$message({
              message: "Saved successfully",
              type: "success",
            });
          } else {
            this.$confirm("Formula name already exists. Overwrite?", "Confirm", {
              confirmButtonText: "Yes",
              cancelButtonText: "No",
              type: "warning",
            })
              .then(() => {
                this.updateData(this.formulaName, this.formulaValue);
                this.loadSavedFormula();
                this.saveDialogVisible = false;
                this.$message({
                  message: "Updated successfully",
                  type: "success",
                });
              })
              .catch(() => {});
          }
        });
      } else {
        this.$message({
          message: "Please enter both a name and a formula",
          type: "error",
        });
      }
    },
  },
};
</script>

<style scoped>
.main-container {
  height: 100%;
  background-color: #f5f7fa;
}

.app-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  z-index: 10;
}

.brand {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.editor-main {
  padding: 0;
  overflow: hidden;
  position: relative;
}

.custom-icon {
  width: auto !important;
  padding: 0 5px;
  font-size: 12px;
  min-width: 30px;
}

/* Drawer Styles */
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px;
}

.search-box {
  margin-bottom: 15px;
}

.formula-list {
  flex: 1;
  overflow-y: auto;
}

.formula-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 10px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.formula-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  border-color: #b3d8ff;
}

.card-header {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafc;
}

.formula-title {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.delete-btn {
  color: #f56c6c;
}
.delete-btn:hover {
  color: #f78989;
}

.card-preview {
  padding: 5px;
  background: #fff;
}
</style>
