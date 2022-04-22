<template>
  <div id="main">
    <mavon-editor
      v-model="value"
      :toolbars="toolbars"
      :defaultOpen="preview"
      :subfield="subfield"
    >
      <template slot="left-toolbar-before">
        <button
          type="button"
          @click="openList"
          class="op-icon fa fa-list-ul"
          aria-hidden="true"
          title="查看已存公式"
        ></button>
      </template>
      <template slot="left-toolbar-before">
        <button
          type="button"
          @click="openSave"
          class="op-icon fa fa-floppy-o"
          aria-hidden="true"
          title="保存公式"
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
      saveDialogVisible: false,
      listDialogVisible: false,
      formulaName: "",
      tableData: [],
      searchInput: "",
    };
  },
  mounted() {
    this.helpValue = this.getTxt("static/simpleHelp.txt");
    this.loadSavedFormula();
  },
  methods: {
    search() {
      if (this.searchInput == "") {
        this.loadSavedFormula();
      } else {
        this.$db.find({ formulaName: this.searchInput }, (err, docs) => {
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
      }
    },
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
    deleteFormula(row) {
      this.deleteData(row.formulaName);
      this.loadSavedFormula();
      this.$message({
        message: "删除成功",
        type: "success",
      });
    },
    editFormula(row) {
      this.value = row.formula;
      this.formulaName = row.formulaName;
      this.listDialogVisible = false;
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
    deleteData(name) {
      this.$db.remove({ formulaName: name }, {}, function (err, data) {
        if (err) {
          console.log(err);
          return;
        }
      });
    },
    openSave() {
      this.saveDialogVisible = true;
    },
    openList() {
      this.listDialogVisible = true;
    },
    Save() {
      this.saveDialogVisible = false;
      if (this.formulaName != "" && this.value != "") {
        this.$db.find({ formulaName: this.formulaName }, (err, docs) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log(docs.length);
          if (docs.length == 0) {
            this.insertData(this.formulaName, this.value);
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
                console.log(this.value);
                this.updateData(this.formulaName, this.value);
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
