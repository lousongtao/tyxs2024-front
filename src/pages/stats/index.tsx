import {PageContainer} from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import React, {useEffect, useRef, useState} from "react";
import {getOrgTypes, getPopsciMgmt, getStats, printReccApi} from "@/services/ant-design-pro/api";
import {Button, Card, Select, Space, Table, Upload} from "antd";
import BrandModal from "@/pages/Brand/component/BrandModal";
import OutstandingPeopleModal from "@/pages/OutstandingPeople/component/OutstandingPeopleModal";
import PopsciMgmtORGModal from "@/pages/PopsciMgmt/component/PopsciMgmtORGModal";
import PopsciMgmtIndividualModal from "@/pages/PopsciMgmt/component/PopsciMgmtIndividualModal";
import ViewModal from "@/pages/WorksMgmt/component/ViewModal";


const TableList = () => {
  const [dataSource, setDataSource] = useState([]);
  const [orgTypes, setOrgTypes] = useState([]);
  const [tjdw, setTjdw] = useState([]);
  const [sbdw, setSbdw] = useState([]);
  const [editBrand, setEditBrand] = useState({});
  const [editPeople, setEditPeople] = useState({});
  const [editMgmtOrg, setEditMgmtOrg] = useState({});
  const [editMgmtIndividual, setEditMgmtIndividual] = useState({});
  const [editWorks, setEditWorks] = useState({});
  const [showBrandDialog, setShowBrandDialog] = useState(false);
  const [showPeopleDialog, setShowPeopleDialog] = useState(false);
  const [showMgmtOrgDialog, setShowMgmtOrgDialog] = useState(false);
  const [showMgmtIndividualDialog, setShowMgmtIndividualDialog] = useState(false);
  const [showWorksDialog, setShowWorksDialog] = useState(false);
  const columns = [
    {
      title: 'row',
      dataIndex: 'row',
      hideInTable: true,
      hideInSearch: true
    },
    {
      title: '',
      dataIndex: 'type',
      hideInSearch: true
    },
    {
      title: '推荐单位',
      dataIndex: 'tjdwCount',
      width: 200,
      hideInSearch: true
    },
    {
      title: '申报单位',
      dataIndex: 'sbdwCount',
      width: 200,
      hideInSearch: true
    },
    {
      title: '科普品牌',
      dataIndex: 'brandCount',
      width: 200,
      hideInSearch: true,
      render: (text, record, index) => {
        if (record.row === 4) return <Button onClick={() => getBrandNoRecc(record.brands)}>{text}</Button>;
        return text;
      }
    },
    {
      title: '科普管理-个人',
      dataIndex: 'mgmtPersonCount',
      width: 200,
      hideInSearch: true,
      render: (text, record, index) => {
        if (record.row === 4) return <Button onClick={() => getMgmtIndividualNoRecc(record.mgmtPersons)}>{text}</Button>;
        return text;
      }
    },
    {
      title: '科普管理-机构',
      dataIndex: 'mgmtOrgCount',
      width: 200,
      hideInSearch: true,
      render: (text, record, index) => {
        if (record.row === 4) return <Button onClick={() => getMgmtOrgNoRecc(record.mgmtOrgs)}>{text}</Button>;
        return text;
      }
    },
    {
      title: '科普作品',
      dataIndex: 'worksCount',
      width: 200,
      hideInSearch: true,
      render: (text, record, index) => {
        if (record.row === 4) return <Button onClick={() => getWorksNoRecc(record.works)}>{text}</Button>;
        return text;
      }
    },
    {
      title: '科普人物',
      dataIndex: 'peopleCount',
      width: 200,
      hideInSearch: true,
      render: (text, record, index) => {
        if (record.row === 4) return <Button onClick={() => getPeopleNoRecc(record.people)}>{text}</Button>;
        return text;
      }
    }
  ];

  const colNoRecc = [
    {
      title: 'id',
      dataIndex: 'id',
      hideInTable: true,
      hideInSearch: true
    },
    {
      title: '推荐单位',
      dataIndex: 'tjdw',
      width: 200,
      hideInSearch: true
    },
    {
      title: '申报单位',
      dataIndex: 'sbdw',
      width: 200,
      hideInSearch: true
    },
    {
      title: '类型',
      dataIndex: 'orgType',
      width: 200,
      hideInSearch: true
    },
    {
      title: '数据',
      dataIndex: 'data',
      width: 200,
      hideInSearch: true
    },
    {
      title: '操作',
      width: 180,
      key: 'option',
      valueType: 'option',
      render: (text, record) => <a key="primary" onClick={() => handleView(record)}>查看</a>
    }
  ];

  const handleView = (record) => {
    if (record.type == 'brand') {
      setEditBrand(record.record);
      setShowBrandDialog(true);
    }
    if (record.type == 'works') {
      // setEditWorks(record.record);
      // setShowWorksDialog(true);
    }
    if (record.type == 'mgmtOrg') {
      setEditMgmtOrg(record.record);
      setShowMgmtOrgDialog(true);
    }
    if (record.type == 'mgmtIndividual') {
      setEditMgmtIndividual(record.record);
      setShowMgmtIndividualDialog(true);
    }
    if (record.type == 'people') {
      setEditPeople(record.record);
      setShowPeopleDialog(true);
    }
  }

  // useEffect(async() => {
  //   const orgTypes = await getOrgTypes();
  //   setOrgTypes(orgTypes);
  // }, []);

  useEffect(() => {
    const fetchData = async() => {
      const orgTypes = await getOrgTypes();
      setOrgTypes(orgTypes);
    }
    fetchData();
  }, []);

  const getTjdw = (id) => {
    for (let i = 0; i < tjdw.length; i++) {
      if (tjdw[i].id == id) return tjdw[i];
    }
  }

  const getSbdw = (id) => {
    for (let i = 0; i < sbdw.length; i++) {
      if (sbdw[i].id == id) return sbdw[i];
    }
  }

  const getOrgType = (id) => {
    for (let i = 0; i < orgTypes.length; i++) {
      if (orgTypes[i].id == id) return orgTypes[i].name;
    }
  }

  const getAccountData = (accountId) => {
    const sb = getSbdw(accountId);
    const tj = getTjdw(sb.parentAccountId);
    return {
      tjdw: tj.name,
      tjdwPhone: tj.phone,
      sbdw: sb.name,
      sbdwPhone: sb.phone,
      orgType: getOrgType(tj.orgTypeId),
    };
  }
  const getBrandNoRecc = (brands) => {
    const dataSource = [];
    brands.forEach(b => {
      const obj = getAccountData(b.accountId);
      obj.id = b.id;
      obj.data = b.name;
      obj.type = 'brand';
      obj.record = b;
      dataSource.push(obj);
    });
    setDataSource(dataSource);
  }

  const getWorksNoRecc = (works) => {
    const dataSource = [];
    works.forEach(w => {
      const obj = getAccountData(w.accountId);
      obj.id = w.id;
      obj.data = w.title;
      obj.type = 'works';
      obj.record = w;
      dataSource.push(obj);
    });
    setDataSource(dataSource);
  }
  const getMgmtOrgNoRecc = (mgmt) => {
    const dataSource = [];
    mgmt.forEach(m => {
      const obj = getAccountData(m.accountId);
      obj.id = m.id;
      obj.data = m.deptName;
      obj.type = 'mgmtOrg';
      obj.record = m;
      dataSource.push(obj);
    });
    setDataSource(dataSource);
  }
  const getMgmtIndividualNoRecc = (mgmt) => {
    const dataSource = [];
    mgmt.forEach(m => {
      const obj = getAccountData(m.accountId);
      obj.id = m.id;
      obj.data = m.name;
      obj.type = 'mgmtIndividual';
      obj.record = m;
      dataSource.push(obj);
    });
    setDataSource(dataSource);
  }
  const getPeopleNoRecc = (people) => {
    const dataSource = [];
    people.forEach(p => {
      const obj = getAccountData(p.accountId);
      obj.id = p.id;
      obj.data = p.name;
      obj.type = 'people';
      obj.record = p;
      dataSource.push(obj);
    });
    setDataSource(dataSource);
  }

  const actionRef = useRef();

  const queryStats = async (params) => {
    const stats = await getStats(params);
    setTjdw(stats.data[0].tjdws);
    setSbdw(stats.data[0].sbdws);
    return stats;
  }

  const closeViewModal = () => {
    setShowPeopleDialog(false);
    setShowWorksDialog(false);
    setShowMgmtOrgDialog(false);
    setShowMgmtIndividualDialog(false);
    setShowBrandDialog(false);
  }

  return (
    <Space direction="vertical" size="middle">
      <ProTable
        rowKey="row"
        actionRef={actionRef}
        pagination={false}
        search={false}
        options={ {density: false, fullScreen: false, reload: false, setting: false} }
        request={(params) => queryStats(params)}
        columns={columns}
      />
      <Card title="明细" size="big">
        <ProTable
          rowKey="id"
          pagination={false}
          search={false}
          options={ {density: false, fullScreen: false, reload: false, setting: false} }
          columns={colNoRecc}
          dataSource={dataSource}/>
      </Card>
      <BrandModal
        onCancel={closeViewModal}
        closeModal={closeViewModal}
        modalTitle='科普品牌'
        editObj={editBrand}
        hideReturn={true}
        viewMode={true}
        visible={showBrandDialog} />
      <OutstandingPeopleModal
        onCancel={closeViewModal}
        closeModal={closeViewModal}
        modalTitle='科普人物'
        editObj={editPeople}
        hideReturn={true}
        viewMode={true}
        visible={showPeopleDialog}
      />
      <PopsciMgmtORGModal
        onCancel={closeViewModal}
        closeModal={closeViewModal}
        modalTitle='科普管理-机构'
        editObj={editMgmtOrg}
        hideReturn={true}
        viewMode={true}
        visible={showMgmtOrgDialog}
      />
      <PopsciMgmtIndividualModal
        onCancel={closeViewModal}
        closeModal={closeViewModal}
        modalTitle='科普管理-个人'
        editObj={editMgmtIndividual}
        hideReturn={true}
        viewMode={true}
        visible={showMgmtIndividualDialog}
      />
      <ViewModal
        onCancel={closeViewModal}
        closeModal={closeViewModal}
        hideReturn={true}
        editObj={editWorks}
        visible={showWorksDialog}/>
    </Space>

  )
}

export default TableList;
