package com.gkhb.keyvehicle.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gkhb.keyvehicle.mapper.VehicleOnlineStateMapper;
import com.gkhb.keyvehicle.model.VehicleOnlineState;
import com.gkhb.keyvehicle.model.param.QueryConditionData;

@Service
public class VehicleOnlineStateServiceImpl implements VehicleOnlineStateService {
	@Autowired
	private VehicleOnlineStateMapper vehicleOnlineStateMapper;

	@Override
	public void addOrUpdateVehicleOnlineState(QueryConditionData queryConditionData) {
		//当前在线表所有车辆
		List<VehicleOnlineState> voslist = vehicleOnlineStateMapper.queryAllOnline();
		//统计出的在线车辆
		List<VehicleOnlineState> onlinelist = vehicleOnlineStateMapper.queryOnlineVehicles(queryConditionData);
		
		for (int j = 0; j < voslist.size(); j++) {
			boolean b = false;
			for (int i = 0; i < onlinelist.size(); i++) {
				if(onlinelist.get(i).getVehicleId().equals(voslist.get(j).getVehicleId())){
					b = true;
					break;
				}
			}
			VehicleOnlineState v = new VehicleOnlineState();
			v.setVehicleId(voslist.get(j).getVehicleId());
			if(b){
				v.setVehicleState(1);
			}else{
				v.setVehicleState(0);
			}
			vehicleOnlineStateMapper.updateVehicleOnline(v);
		}
	}
	
	

}
