package com.gkhb.keyvehicle.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.gkhb.keyvehicle.common.model.Page;
import com.gkhb.keyvehicle.model.DisposalEntry;
import com.gkhb.keyvehicle.model.DisposalProcess;
import com.gkhb.keyvehicle.model.param.QueryConditionData;
import com.gkhb.keyvehicle.model.view.DisposalProcessView;


/**
 *	预警处置流程mapper
 *	@author weidongping
 *	@createTime 2017年9月7日 上午10:27:02
 */
@Repository
public interface DisposalProcessMapper {
	
	/**
	 * 添加预警处置流程
	 * @param disposalprocess
	 */
	public void addDisposalProcess(DisposalProcess  disposalProcess);

	
	/**
	 * 查询所有预警处置流程
	 * @return
	 */
	public List<DisposalProcess> queryDisposalProcess();
	
	/**
	 * 通过车辆类型和车牌号码查询处置流程信息
	 * @return
	 */
	public List<DisposalProcess> queryDisposalByVehicleInfo(@Param("queryConditionData")QueryConditionData queryConditionData,Page page);
	
	/**
	 * 通过车辆类型和车牌号码查询已处置的信息
	 * @param queryConditionData
	 * @param page
	 * @return
	 */
	public List<DisposalProcess> queryDisposalProcessByVehicleInfo(@Param("queryConditionData")QueryConditionData queryConditionData,Page page);
	
	/**
	 * 分页查询预警处置流程
	 * @return
	 */
	public List<DisposalProcess> queryDisposalProcess(Page page);

	/**
	 * 修改预警处置流程
	 * @param disposalprocess
	 * @return
	 */
	public int updateDisposalProcess(DisposalProcess  disposalProcess);
	
	/**
	 * 修改处置录入流程
	 * @param disposalEntry
	 * @return
	 */
	public int updateDisposalEntry(DisposalEntry disposalEntry);
	
	/**
	 * 修改抄报状态
	 * @param disposalProcess
	 * @return
	 */
	public int updateJgCcState(@Param("disposalProcessView")DisposalProcessView disposalProcessView);

    /**
     * 查询交管局部门预警处置
     * @return
     */
    public List<DisposalProcess> queryJGJBMDisposalProcess(@Param("department")String department, Page page);

    /**
     * 查询行业主管部门预警处置
     * @return
     */
    public List<DisposalProcess> queryHYBMDisposalProcess(@Param("department")String department, Page page);
    
    /**
     * 根据预警ID查询预警处置信息
     * @param warningId
     * @return
     */
    public DisposalProcess queryDisposalProcessByWarningId(@Param("warningId")String warningId);
}

	
	


