import {
  Button, Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal, notification, Popconfirm, Radio,
  Select, Space
} from "antd";
import {getTjdwAccount, returnWorks} from "@/services/ant-design-pro/api";
import React, {useEffect, useState} from "react";
import PrizeTable from "@/pages/component/PrizeTable";
import SubsidizeTable from "@/pages/component/SubsidizeTable";
import ReturnConfirmModal from "@/pages/component/ReturnConfirmModal";

/**
 * 查看作品界面
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const ViewModal = (props) => {

  const [form] = Form.useForm();

  const [editObj, setEditObj] = React.useState({});
  const [returnConfirmModalVisible, setReturnConfirmModalVisible] = useState(false);
  const buildForm = () => {
    return (
      <Form
        style={{margin: 7}}
        labelCol={{span: 6}}
        wrapperCol={{span: 14}}
        form={form}
        scrollToFirstError>
        <Form.Item
          name="title"
          label="标题">
          <Input style={{width:400}} disabled/>
        </Form.Item>
        <Form.Item
          name="poster"
          label="作者">
          <Input style={{width:200}} disabled/>
        </Form.Item>
        <Form.Item
          name="phone"
          label="作者电话">
          <Input style={{width:200}} disabled/>
        </Form.Item>
        <Form.Item
          name="vendor"
          label="制作单位">
          <Input style={{width:200}} disabled/>
        </Form.Item>
        <Form.Item name="type" label="类别" >
          <Select style={{width:400}} disabled>
            <Select.OptGroup label="图文类" key={1}>
              <Select.Option value={11} key={11}>科普文章</Select.Option>
              <Select.Option value={12} key={12}>漫画</Select.Option>
              <Select.Option value={13} key={13}>海报折页</Select.Option>
              <Select.Option value={14} key={14}>其它</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="图书类" key={4}>
              <Select.Option value={41} key={41}>图书类</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="音频类" key={2}>
              <Select.Option value={21} key={21}>专题音频</Select.Option>
              <Select.Option value={22} key={22}>广播剧</Select.Option>
              <Select.Option value={23} key={23}>有声书</Select.Option>
              <Select.Option value={24} key={24}>其他</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="视频类" key={3}>
              <Select.Option value={31} key={31}>单集作品 - 短视频(小于10分钟)</Select.Option>
              <Select.Option value={32} key={32}>单集作品 - 长视频(大于10分钟)</Select.Option>
              <Select.Option value={33} key={33}>系列作品 - 短视频(小于10分钟)</Select.Option>
              <Select.Option value={34} key={34}>系列作品 - 长视频(大于10分钟)</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="舞台表演类" key={5}>
              <Select.Option value={51} key={51}>演讲</Select.Option>
              <Select.Option value={52} key={52}>脱口秀</Select.Option>
              <Select.Option value={53} key={53}>舞台剧</Select.Option>
            </Select.OptGroup>
          </Select>
        </Form.Item>
        <Form.Item name="topic" label="主题">
          <Input style={{width:400}} disabled/>
        </Form.Item>
        <Form.Item
          name="tjdwTag"
          label="机构类型">
          <Input style={{width:400}} disabled/>
        </Form.Item>
        <Form.Item
          name="tjdw"
          label="推荐单位">
          <Input style={{width:400}} disabled/>
        </Form.Item>

        <Form.Item
          name="mediaName"
          label="刊播媒体/出版社">
          <Input style={{width:400}} disabled/>
        </Form.Item>
        <Form.Item
          name="subMediaName"
          label="版面/栏目/ISBN编号">
          <Input style={{width:400}} disabled/>
        </Form.Item>
        <Form.Item
          name="mediaPlayDate"
          label="首次刊播/刊登/出版时间">
          <DatePicker placeholder="刊播日期" disabled />
        </Form.Item>
        <Form.Item
          name="mediaPlayTimes"
          label="最高阅读/播放量/发行量(万)">
          <InputNumber placeholder="播放量" disabled />
        </Form.Item>
        <Form.Item
          name="mediaLink"
          label="作品链接">
          {getWorksLink()}
        </Form.Item>
        <Form.Item
          name="worksLink"
          label="作品材料">
          {getFileUrlLink()}
        </Form.Item>
        <Form.Item
          name="worksLink"
          label="推荐表">
          {getReccFormUrlLink()}
        </Form.Item>
        <Form.Item name="selfRecommendation" label="自荐说明">
          <Input.TextArea
            showCount
            rows={6}
            disabled/>
        </Form.Item>
        <PrizeTable
          prizeList={editObj.prizeList ? editObj.prizeList : []}
          onChangePrize={(prizeList) => editObj.prizeList = prizeList}
          onDeletePrize={(prizeList) => editObj.prizeList = prizeList}
          disabled />
        <SubsidizeTable
          subsidizeList={editObj.subsidizeList ? editObj.subsidizeList : []}
          onChangeSubsidize={(subsidizeList) => editObj.subsidizeList = subsidizeList}
          onDeleteSubsidize={(subsidizeList) => editObj.subsidizeList = subsidizeList}
          disabled />
        <Card title="申报项目情况" bordered={false} style={{ width: '100%' }}>
          <Form.Item name="projectBrief" label="项目综述" labelCol={4} wrapperCol={20}>
            <Input.TextArea
              showCount
              rows={6}
              disabled/>
          </Form.Item>
          <Form.Item name="projectDesc" label="项目介绍" labelCol={4} wrapperCol={20}>
            <Input.TextArea
              showCount
              rows={14}
              disabled />
          </Form.Item>
        </Card>
      </Form>
    )
  }

  //java 保存的路径中, 有时候正斜线, 有时候反斜线
  const getFileUrlLink = () => {
    if (editObj?.fileUrl){
      const segs = editObj.fileUrl.replace(/\\/g, '/').split('/WorksFiles/');
      return <a href={'http://workscollect.shbxjk.cn/WorksFiles/' + segs[1]} target='_blank'>点击查看</a>
    }
    return <></>
  }

  const getWorksLink = () => {
    if (editObj?.mediaLink){
      return <a href={editObj?.mediaLink} target='_blank'>{editObj?.mediaLink}</a>
    }
    return <></>
  }

  //java 保存的路径中, 有时候正斜线, 有时候反斜线
  const getReccFormUrlLink = () => {
    if (editObj?.reccFormFileUrl){
      const segs = editObj.reccFormFileUrl.replace(/\\/g, '/').split('/WorksReccForm/');
      return <a href={'http://workscollect.shbxjk.cn/WorksReccForm/' + segs[1]} target='_blank'>点击查看</a>
    }
    return <h4 style={{color: 'red'}}>申报单位未提交推荐表</h4>
  }

  const handleReturn = async (reason: string) => {
    setReturnConfirmModalVisible(false);
    try{
      let works = await returnWorks(editObj.id, reason);

      if (works){
        if (status == 0){
          notification['success']({
            message: '记录回退成功 - ' + editObj.title,
            duration: 0
          });
        } else notification['error']({message: '提交失败. 状态'+ status });
        form.resetFields();
        props.onReturn();
      } else {
        notification['error']({message: '提交失败.' });
      }
    } catch (error) {
      notification['error']({
        message: '提交失败. 错误: ' + error?.info?.message
      })
    }
  }

  const handleCancelReturn = () => {
    setReturnConfirmModalVisible(false);
  }

  /**
   * effect不能用props.editObj做检查判断, 如果连续编辑同一条记录导致对象无变化的话, effect就不会重复执行.
   * effect不能只执行一次, 第一次执行是在父类初始化的时候. 要求每次改变props值都要执行一次
   * todo: 在2023版本中, 这个方法是注释掉的, 可以看到这个方法跟下面的useEffect完全一致, 但是2024版本不增加这个副作用的话,
   * 获奖经历等第一次载入时为空, 其后每次载入的是上次打开的数据. 推测原因: 在2024版中, useEffect不能直接使用async方法, 要在内部定义个子async方法.
   * 可能这个原因导致state machine没有正确刷新table内的数据(通过调试发现table.prop持有的数据已经是最新的, 但是却无法触发界面刷新). 所以在2024版
   * 中, 取消该方法注释, 同时将另一个useEffect仅仅保留async的部分. 目前测试这个没有异常.
   */
  useEffect(() => {
    if (props.editObj !== editObj){
      //要先把form清空, 再重新设置新的值, 否则当add的时候, 传入空对象, 无法覆盖之前的显示
      form.resetFields();
      form.setFieldsValue(props.editObj);
      setEditObj(props.editObj);
    }
  } );

  /**
   * effect不能用props.editObj做检查判断, 如果连续编辑同一条记录导致对象无变化的话, effect就不会重复执行.
   * effect不能只执行一次, 第一次执行是在父类初始化的时候. 要求每次改变props值都要执行一次
   * 在2023版本中可以直接给useEffect制定async方法, 但是升级后不能这样做了, 只能定义一个async方法, 然后在useEffect中调用它.
   * 否则会出现destroy is not a function异常.
   */
  useEffect( () => {
    const fetchData = async () => {
      if (props.editObj !== editObj){
        // 载入推荐用户信息
        if (props.editObj?.id){
          const tjdwacc = await getTjdwAccount(props.editObj.id);
          form.setFieldsValue({
            tjdwTag: tjdwacc.orgTypeName,
            tjdw: tjdwacc.name
          })
        }
      }
    }
    fetchData();
  } );

  const handleCancel = () => {
    setEditObj({});
    props.onCancel();
  }

  return (
    <div>
      <Modal
        title={props.modalTitle}
        getContainer={false}
        centered
        destroyOnClose
        maskClosable={false}
        visible={props.visible}
        closable={false}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            关闭
          </Button>,
          <Button key='cancel' onClick={() => setReturnConfirmModalVisible(true)}>
            退回
          </Button>
        ]}
        width={1000}>
        {buildForm()}
      </Modal>
      <ReturnConfirmModal
        visible={returnConfirmModalVisible}
        handleReturn={handleReturn}
        handleCancelReturn={handleCancelReturn}
      />
    </div>
  )
}

export default ViewModal;
