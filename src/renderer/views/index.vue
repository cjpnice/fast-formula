<template>
  <div id="main">
    <mavon-editor
      v-model="formulaValue"
      :toolbars="toolbars"
      defaultOpen="preview"
      :subfield="subfield"
      ref="md"
      id="math"
    >
      <template slot="left-toolbar-before">
        <button
          type="button"
          @click="listDialogVisible = true"
          class="op-icon fa fa-list-ul"
          aria-hidden="true"
          title="查看已存公式"
        ></button>
      </template>
      <template slot="left-toolbar-before">
        <button
          type="button"
          @click="saveDialogVisible = true;"
          class="op-icon fa fa-floppy-o"
          aria-hidden="true"
          title="保存公式"
        ></button>
      </template>
      <template slot="right-toolbar-before">
        <button
          type="button"
          @click="copy('mathml')"
          class="op-icon fa fa-clipboard"
          aria-hidden="true"
          title="复制MathML格式(word)"
        ></button>
      </template>
      <template slot="right-toolbar-before">
        <button
          type="button"
          @click="copy('latex')"
          class="op-icon fa fa-files-o"
          aria-hidden="true"
          title="复制LaTeX格式"
        ></button>
      </template>
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
      <template slot="left-toolbar-after"> | </template>
      <template slot="left-toolbar-after">
        <button
          v-for="item in hotKeyList"
          :key="item.id"
          type="button"
          @click="setValue(item.name)"
          class="op-icon"
          aria-hidden="true"
          :title="item.title"
          style="width: 40px"
        >{{ item.title }}
        </button>
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

    <el-dialog title="保存公式" :visible.sync="saveDialogVisible" width="30%">
      <el-input v-model="formulaName" placeholder="请输入公式名称"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="Save">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="已存公式"
      :visible.sync="listDialogVisible"
      :fullscreen="true"
    >
      <div style="margin-top: -30px">
        <el-input
          v-model="searchInput"
          placeholder="请输入公式名称"
          style="width: 20%"
          size="mini"
          clearable
        ></el-input>
        <el-button
          icon="el-icon-search"
          circle
          size="mini"
          @click="search"
        ></el-button>
      </div>

      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="formulaName" label="公式名" width="200">
        </el-table-column>
        <el-table-column label="公式">
          <template slot-scope="scope">
            <mavon-editor
              v-model="scope.row.formula"
              :toolbarsFlag="false"
              :editable="false"
              :subfield="false"
              defaultOpen="preview"
              style="min-height: auto"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              type="danger"
              size="mini"
              @click="deleteFormula(scope.row)"
              >删除</el-button
            >
            <el-button
              type="primary"
              size="mini"
              @click="editFormula(scope.row)"
              >编辑</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="listDialogVisible = false"
          size="small"
          type="success"
          >关 闭</el-button
        >
      </span>
    </el-dialog>
  </div>
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
      moreTitle: "查看更多符号", // 是否显示更多帮助文档提示信息
      toolbars: {}, // 显示的toolBars
      saveDialogVisible: false, // 是否显示保存视图的对话框
      listDialogVisible: false, // 是否显示已存视图的对话框
      formulaName: "", // 公式名称
      tableData: [], // 已存公式列表
      searchInput: "", // 搜索公式的输入
      hotKeyList: [
        // 自定义的toolBars
        {
          id: 1,
          name: "sum",
          title: "求和",
        },
        {
          id: 2,
          name: "frac",
          title: "分式",
        },
        {
          id: 3,
          name: "lim",
          title: "极限",
        },
        {
          id: 4,
          name: "partial",
          title: "微分",
        },
        {
          id: 5,
          name: "∞",
          title: "∞",
        },
        {
          id: 6,
          name: "α",
          title: "α",
        },
        {
          id: 7,
          name: "β",
          title: "β",
        },
        {
          id: 8,
          name: "ω",
          title: "ω",
        },
        {
          id: 9,
          name: "θ",
          title: "θ",
        },
        {
          id: 10,
          name: "λ",
          title: "λ",
        },
        {
          id: 11,
          name: "μ",
          title: "μ",
        },
        {
          id: 12,
          name: "σ",
          title: "σ",
        },
      ],
    };
  },
  watch: {
    /*
     *监听formulaValue的变化，提示用户不要删除'$$'
     */
    formulaValue(newVal, oldVal) {
      if (
        newVal.substring(0, 2) != "$$" ||
        newVal.substring(newVal.length - 2, newVal.length) != "$$"
      ) {
        this.$notify({
          title: "提示！",
          message: " 请不要删除'$$'",
        });
      }
    },
  },
  mounted() {
    this.helpValue = this.getTxt("static/simpleHelp.txt");
    this.loadSavedFormula();
  },
  methods: {
    /*
     *将Latex转化为MathML
     */
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
    /*
     *type为mathml时，将Latex转化为MathML并复制到剪贴板
     *type为latex时，直接Latex复制到剪贴板
     */
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
                  message: "复制成功，粘贴至word吧",
                  type: "success",
                });
              },
              function (e) {
                _this.$message({
                  message: "复制失败",
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
              message: "复制成功",
              type: "success",
            });
          },
          function (e) {
            _this.$message({
              message: "复制失败",
              type: "error",
            });
          }
        );
      }
    },
    /*
     *设置快捷键输出的字符
     */
    setValue(value) {
      switch (value) {
        case "sum":
          value = "\\sum_{x}^{s}{A}";
          break;
        case "frac":
          value = "\\frac{a}{b}";
          break;
        case "lim":
          value = "\\lim_{x \\to 0}{x}";
          break;
        case "partial":
          value = "\\partial{x}";
          break;
        case "int":
          value = "\\int^{\\infty}_{0}{xdx}";
          break;
        case "∞":
          value = "\\infty";
          break;
        case "α":
          value = "\\alpha";
          break;
        case "β":
          value = "\\beta";
          break;
        case "ω":
          value = "\\omega";
          break;
        case "θ":
          value = "\\theta";
          break;
        case "λ":
          value = "\\lambda";
          break;
        case "μ":
          value = "\\mu";
          break;
        case "σ":
          value = "\\sigma";
          break;
      }

      const $vm = this.$refs.md;
      $vm.insertText($vm.getTextareaDom(), {
        prefix: value,
        subfix: "",
        str: "",
      });
    },
    /*
     *搜索公式
     */
    search() {
      if (this.searchInput == "") {
        this.loadSavedFormula();
      } else {
        this.$db.find({ formulaName: this.searchInput }, (err, docs) => {
          if (err) {
            return;
          }
          this.tableData.splice(0, this.tableData.length);
          for (var i = 0; i < docs.length; i++) {
            this.tableData.push({
              formulaName: docs[i].formulaName,
              formula: docs[i].formula,
            });
          }
        });
      }
    },
    /*
     *加载已存公式
     */
    loadSavedFormula() {
      this.$db.find({}, (err, docs) => {
        if (err) {
          console.log(err);
          return;
        }
        this.tableData.splice(0, this.tableData.length);
        for (var i = 0; i < docs.length; i++) {
          this.tableData.push({
            formulaName: docs[i].formulaName,
            formula: docs[i].formula,
          });
        }
      });
    },
    /*
     *删除公式
     */
    deleteFormula(row) {
      this.deleteData(row.formulaName);
      this.loadSavedFormula();
      this.$message({
        message: "删除成功",
        type: "success",
      });
    },
    /*
     *编辑公式
     */
    editFormula(row) {
      this.formulaValue = row.formula;
      this.formulaName = row.formulaName;
      this.listDialogVisible = false;
    },
    /*
     *读取txt文件
     */
    getTxt(path) {
      let xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
      xhr.open("GET", path, false);
      xhr.overrideMimeType("text/html;charset=utf-8");
      xhr.send(null);
      return xhr.responseText;
    },
    /*
     *切换预览
     */
    changePreview() {
      this.subfield = !this.subfield;
    },
    /*
     *切换帮助文档
     */
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
    /*
     *新增公式
     */
    insertData(name, data) {
      this.$db.insert(
        { formulaName: name, formula: data },
        function (err, doc) {
          if (err) {
            console.log(err);
            return;
          }
        }
      );
    },
    /*
     *更新公式
     */
    updateData(name, data) {
      this.$db.update(
        {
          formulaName: name,
        },
        {
          $set: {
            formula: data,
          },
        },
        function (err, data) {
          if (err) {
            console.log(err);
            return;
          }
        }
      );
    },
    /*
     *删除公式
     */
    deleteData(name) {
      this.$db.remove({ formulaName: name }, {}, function (err, data) {
        if (err) {
          console.log(err);
          return;
        }
      });
    },
    /*
     *保存公式
     */
    Save() {
      this.saveDialogVisible = false;
      if (this.formulaName != "" && this.formulaValue != "") {
        this.$db.find({ formulaName: this.formulaName }, (err, docs) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log(docs.length);
          if (docs.length == 0) {
            this.insertData(this.formulaName, this.formulaValue);
            this.loadSavedFormula();
            this.$message({
              message: "保存成功",
              type: "success",
            });
          } else {
            this.$confirm("已存在该名称公式, 是否覆盖?", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            })
              .then(() => {
                this.updateData(this.formulaName, this.formulaValue);
                this.loadSavedFormula();
                this.$message({
                  message: "保存成功",
                  type: "success",
                });
              })
              .catch(() => {
                this.$message({
                  type: "info",
                  message: "已取消",
                });
              });
          }
        });
      } else {
        this.$message({
          message: "请输入公式和公式名",
          type: "error",
        });
      }
    },
  },
};
</script>
