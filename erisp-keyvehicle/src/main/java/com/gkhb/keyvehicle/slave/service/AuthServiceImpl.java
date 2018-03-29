package com.gkhb.keyvehicle.slave.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gkhb.keyvehicle.model.Auth;
import com.gkhb.keyvehicle.model.Resource;
import com.gkhb.keyvehicle.slave.mapper.AuthMapper;

/**
 *	权限信息服务实现类
 *	@author chenxiaojie
 *	@createTime 2017年10月25日 上午10:21:44
 */
@Service
public class AuthServiceImpl implements AuthService{
	
	protected Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
	
	@Autowired
	private AuthMapper authMapper;

	@Override
	public Auth queryUsernameById(String id) {
		return authMapper.queryUsernameById(id);
	}

	@Override
	public String queryDepNameById(String id) {
		return authMapper.queryDepNameById(id);
	}

	@Override
	public String queryGroupNameById(String id) {
		return authMapper.queryGroupNameById(id);
	}

	@Override
	public List<String> queryResourceIdById(String id) {
		return authMapper.queryResourceIdById(id);
	}

	@Override
	public List<Resource> queryResourceNameById(List<String> resourceId) {
		return authMapper.queryResourceNameById(resourceId);
	}

	/**
	 * 通过角色id获取模块名称
	 */
	@Override
	public List<Resource> getResourceName(String roleId) {
		List<String> resourceId = authMapper.queryResourceIdById(roleId);
		List<Resource> resourceName = authMapper.queryResourceNameById(resourceId);
		/*if(null != resourceName){
			for (int i = 0; i < resourceName.size(); i++) {
				String fstrName = resourceName.get(i).getFstrName();
				switch (fstrName) {
				case "实时监控":
					resourceName.get(i).setAddress("app.map");
					break;
				case "物流车":
					resourceName.get(i).setAddress("app.map");
					break;
				case "轨迹回放":
					resourceName.get(i).setAddress("app.trail");
					break;
				case "车辆查询":
					String vehicleFstrOpenMode = resourceName.get(i).getFstrOpenMode();
					switch (vehicleFstrOpenMode) {
					case "1":
						resourceName.get(i).setAddress("app.vehicleManagement");
						break;
					case "2":
						resourceName.get(i).setAddress("app.vehicleManagement.vehicleManage");
						break;
					default:
						break;
					}
					break;
				case "预警处置":
					resourceName.get(i).setAddress("app.warningDisposal");
					break;
				case "预警监控":
					resourceName.get(i).setAddress("app.warningDisposal.warningMap");
					break;
				case "实时处置":
					resourceName.get(i).setAddress("app.warningDisposal.warningDisposal");
					break;
				case "预警设置":
					resourceName.get(i).setAddress("app.warningDisposal.warningSet");
					break;
				case "预警查询":
					resourceName.get(i).setAddress("app.warningDisposal.warningQuery");
					break;
				case "预警签收":
					resourceName.get(i).setAddress("app.warningDisposal.warningSign");
					break;
				case "处置录入":
					resourceName.get(i).setAddress("app.warningDisposal.disposalEntry");
					break;
				case "预警规则":
					resourceName.get(i).setAddress("app.warningRule");
					break;
				case "预警规则查询":
					resourceName.get(i).setAddress("app.warningRule.ruleQuery");
					break;
				case "时间区域录入":
					resourceName.get(i).setAddress("app.warningRule.ruleTimeAreaAdd");
					break;
				case "速度规则录入":
					resourceName.get(i).setAddress("app.warningRule.ruleSpeedAdd");
					break;
				case "疲劳规则录入":
					resourceName.get(i).setAddress("app.warningRule.ruleTiredAdd");
					break;
				case "处置抄告":
					String warningCopyFstrOpenMode = resourceName.get(i).getFstrOpenMode();
					switch (warningCopyFstrOpenMode) {
					case "1":
						resourceName.get(i).setAddress("app.warningDisposal");
						break;
					case "2":
						resourceName.get(i).setAddress("app.warningDisposal.warningCopy");
						break;
					default:
						break;
					}
					break;
				case "统计报表":
					resourceName.get(i).setAddress("app.reports");
					break;
				case "车辆类型预警统计":
					resourceName.get(i).setAddress("app.reports.countByTypes");
					break;
				case "主管部门预警统计":
					resourceName.get(i).setAddress("app.reports.countByDepartments");
					break;
				case "事故查询":
					String accidentFstrOpenMode = resourceName.get(i).getFstrOpenMode();
					switch (accidentFstrOpenMode) {
					case "1":
						resourceName.get(i).setAddress("app.accidentManagement");
						break;
					case "2":
						resourceName.get(i).setAddress("app.accidentManage.accidentManage");
						break;
					default:
						break;
					}
					break;
				case "违法查询":
					String illegalFstrOpenMode = resourceName.get(i).getFstrOpenMode();
					switch (illegalFstrOpenMode) {
					case "1":
						resourceName.get(i).setAddress("app.illegalManagement");
						break;
					case "2":
						resourceName.get(i).setAddress("app.illegalManage.illegalManage");
						break;
					default:
						break;
					}
					break;
				default:
					break;
				}
			}
		}*/
		return resourceName;
	}

}
