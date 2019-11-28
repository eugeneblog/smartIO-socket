import React from "react";
import { Upload, Button, Icon } from "antd";

export const UploadModule = props => {
  return (
    <Upload {...props}>
      <Button>
        <Icon type="upload" /> Click to Upload
      </Button>
    </Upload>
  );
};
