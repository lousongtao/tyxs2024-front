import {
  Button,
  Form,
  Input,
  message,
  Spin,
  Select,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Popconfirm
} from "antd";
import React from "react";
import {addWorks} from "@/services/ant-design-pro/api";
import UploadAttachment from "@/pages/WorksUpload/UploadAttachment";

const WorksUpload = () => {
  const [form] = Form.useForm();
  const onFinish = async (status) => {
    try{
      const values = await form.validateFields();
      if (values.errorFields){
        message.error("数据输入不完整");
        return;
      }
    } catch (e) {
      message.error("数据验证失败");
      return;
    }
    setLoadData(true);
    const payload = {
      ...form.getFieldsValue(),
      status,
      fileUrl: attachment.length == 0? null: attachment[1]
    }
    try{
      const works = await addWorks(payload);
      if (works){
        message.success("作品提交成功");
        form.resetFields();
      } else {
        message.error("作品提交失败");
      }
    } catch (error) {
      message.error("作品提交失败, "+ error.message);
    }
    setLoadData(false);
  };

  const [loadData, setLoadData] = React.useState(false);//页面加载时启动等待框, 加载数据
  const [attachment, setAttachment] = React.useState([]);

  return (
    <Spin spinning={loadData}>
      <Form
        style={{margin: 7}}
        labelCol={{span: 6}}
        wrapperCol={{span: 14}}
        form={form}
        scrollToFirstError
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{required: true,message: '请输入标题',whitespace: true}]}>
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item
          name="poster"
          label="作者"
          rules={[{required: true,message: '请输入作者',whitespace: true}]}>
          <Input style={{width:200}}/>
        </Form.Item>

        <Form.Item
          name="phone"
          label="电话"
          rules={[{required: true,message: '请输入电话'}]}>
          <Input style={{width:200}}/>
        </Form.Item>
        <Form.Item name="type" label="类别" rules={[{required: true,message: '请选择类别'}]}>
          <Select style={{width:400}}>
            <Select.OptGroup label="图文类" key={1}>
              <Select.Option value="11" key={11}>科普文章</Select.Option>
              <Select.Option value="12" key={12}>漫画</Select.Option>
              <Select.Option value="13" key={13}>海报折页</Select.Option>
              <Select.Option value="14" key={14}>其它</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="音频类" key={2}>
              <Select.Option value="21" key={21}>专题音频</Select.Option>
              <Select.Option value="22" key={22}>广播剧</Select.Option>
              <Select.Option value="23" key={23}>有声书</Select.Option>
              <Select.Option value="24" key={24}>其他</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="视频类" key={3}>
              <Select.Option value="31" key={31}>单集作品 - 短视频(小于10分钟)</Select.Option>
              <Select.Option value="32" key={32}>单集作品 - 长视频(大于10分钟)</Select.Option>
              <Select.Option value="33" key={33}>系列作品 - 短视频(小于10分钟)</Select.Option>
              <Select.Option value="34" key={34}>系列作品 - 长视频(大于10分钟)</Select.Option>
            </Select.OptGroup>
          </Select>
        </Form.Item>
        <Form.Item
          name="mediaLink"
          label="作品链接">
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item
          name="mediaName"
          label="刊播媒体">
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item
          name="subMediaName"
          label="刊播栏目">
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item
          name="mediaPlayDate"
          label="首次刊播时间">
          <DatePicker placeholder="刊播日期"/>
        </Form.Item>
        <Form.Item
          name="mediaPlayTimes"
          label="累计阅读/播放量">
          <InputNumber placeholder="播放量" />
        </Form.Item>
        <Form.Item name="intro" label="介绍"
                   rules={[{required: true,message: '请填写作品介绍'}]}>
          <Input.TextArea rows={5} showCount maxLength={100} style={{width:500}}/>
        </Form.Item>

        <Form.Item name="attachment" label="附件上传">
          <UploadAttachment changeAttatchment={paths => setAttachment(paths)}/>
        </Form.Item>
        <Row>
          <Col span={4} offset={6}>
            <Popconfirm
              onConfirm={() => onFinish(1)}
              title='确认保存当前内容为草稿？保存将覆盖之前草稿内容。'>
              <Button color='DAA520' type="primary">
                保存草稿
              </Button>
            </Popconfirm>
          </Col>
          <Col span={8}>
            <Popconfirm
              onConfirm={() => onFinish(1)}
              title='确认打印当前内容？打印后数据不可再修改。'>
              <Button type="primary" onClick={()=>onFinish(2)}>
                打印
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      </Form>
    </Spin>
  )

}

export default WorksUpload;
