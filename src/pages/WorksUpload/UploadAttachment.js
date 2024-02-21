import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {API_UPLOADFILE, deleteTempFile} from "@/services/ant-design-pro/api";
import {useState} from "react";

export default function UploadAttachment(props) {
  const [fileList, setFileList] = useState([]);
  const handleChange = ({ file, list }) => {
    if (file.status === 'done') {
      fileList.push(file);
      // props.changeAttachment(fileList?.map(f => f.response));
    } else if (file.status === 'error'){
      message.error('文件上传错误.');
    }
  };

  const handleRemove = (file) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    // props.changeAttachment((newFileList && newFileList.length > 0) ? newFileList.map(f => f.response) : undefined);
    deleteTempFile(file.response);
  };

  const acceptFileType = 'image/jpg,image/jpeg,image/gif,image/png,image/bmp,application/pdf,' +
    'text/html,text/htm,text/plain,application/vnd.ms-excel,.doc,.docx,.xls,.xlsx,.ppt,audio/mpeg,' +
    'video/avi,video/mp4,video/wmv,video/wma,video/avi';

  const handleBeforeUpload = (file) => {
    if (fileList.length > 0){
      message.error('只能上传一个文件.');
      return Upload.LIST_IGNORE;
    }
    if (acceptFileType.indexOf(file.type) < 0){
      message.error('不支持上传该文件格式.');
      return Upload.LIST_IGNORE;
    }
    return true;
  }

  return (
    <Upload
      action={API_UPLOADFILE}
      defaultFileList={fileList}
      headers={{Authorization: 'Basic ' + sessionStorage.getItem('auth')}}
      onChange={handleChange}
      onRemove={handleRemove}
      beforeUpload={handleBeforeUpload}
      accept={acceptFileType}
    >
      <Button icon={<UploadOutlined />}>上传</Button>
    </Upload>
  )
}
