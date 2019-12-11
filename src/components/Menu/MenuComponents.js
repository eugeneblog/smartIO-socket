import React from "react";
import { Upload, Button, Icon, Select } from "antd";
const { Option } = Select;

export const UploadModule = props => {
  return (
    <Upload {...props}>
      <Button>
        <Icon type="upload" /> Click to Upload
      </Button>
    </Upload>
  );
};

export const ExportSelectOpt = props => {
  const { optList } = props;
  return (
    <Select {...props}>
      {optList.map((opt, key) => (
        <Option key={key} value={opt.objectName}>
          {opt.objectName}
        </Option>
      ))}
    </Select>
  );
};

