package com.gkhb.keyvehicle.model.view;

import java.util.Date;

/**
 *	车辆实时信息返回类
 *	@author chenxiaojie
 *	@createTime 2017年8月29日 上午11:13:08
 */
public class VehicleInfoView {
	
	/**
	 * 主键ID
	 */
	private String id;
	/**
	 * 车牌号码
	 */
	private String plateNumber;
	/**
	 * 申报企业
	 */
	private String applyCompany;
	/**
	 * 所属企业
	 */
	private String ascriptionCompany;
	/**
	 * 车辆类型
	 */
	private String vehicleType;
	/**
	 * 核定载重
	 */
	private int authorizedLoad;
	/**
	 * 注册登记日期
	 */
	private Date registrationDate;
	/**
	 * 企业联系人
	 */
	private String contacts;
	/**
	 * 联系电话
	 */
	private String phoneNumber;
	/**
	 * 所属系统编号
	 */
	private String systemNumber;
	/**
	 * 牌照类型
	 */
	private String plateType;
	/**
	 * 车辆状态
	 */
	private String vehicleState;
	/**
	 * 车辆在线状态(弃用)
	 */
	private int vehicleOnlineState;
	/**
	 * 主管部门
	 */
	private String competentAuthority;
	/**
	 * 状态
	 */
	private int state;
	/**
	 * 纬度
	 */
	private double latitude;
	/**
	 * 经度
	 */
	private double longitude;
	/**
	 * 报警标志
	 */
	private String warnFlag;
	/**
	 * GPS终端设备上报时间
	 */
	private Date reportTime;
	/**
	 * 预警类型
	 */
	private String warningType;
	/**
	 * 车架号
	 */
	private String vehicleFrameNumber;
	/**
	 * 车速
	 * @return
	 */
	private double speed;
	/**
	 * 预警结束时间
	 */
	private Date warningEndTime;
	/**
	 * 车辆图片url
	 */
	private String platePictureUrl;
	/**
	 * 车辆年审状态
	 */
	private String motTestState;
	/**
	 * 事故次数
	 */
	private int accidentTotal;
	/**
	 * 违法次数
	 */
	private int illegalTotal;
	/**
	 * 入城证
	 */
	private String intoCityCard;
	/**
	 * 运输证
	 */
	private String transportCard;
	/**
	 * 车辆在线状态
	 */
	private String gpsState;
	/**
	 * 分局
	 */
	private String vehicleDept;
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getPlateNumber() {
		return plateNumber;
	}
	public void setPlateNumber(String plateNumber) {
		this.plateNumber = plateNumber;
	}
	public String getApplyCompany() {
		return applyCompany;
	}
	public void setApplyCompany(String applyCompany) {
		this.applyCompany = applyCompany;
	}
	public String getAscriptionCompany() {
		return ascriptionCompany;
	}
	public void setAscriptionCompany(String ascriptionCompany) {
		this.ascriptionCompany = ascriptionCompany;
	}
	public String getVehicleType() {
		return vehicleType;
	}
	public void setVehicleType(String vehicleType) {
		this.vehicleType = vehicleType;
	}
	public int getAuthorizedLoad() {
		return authorizedLoad;
	}
	public void setAuthorizedLoad(int authorizedLoad) {
		this.authorizedLoad = authorizedLoad;
	}
	public Date getRegistrationDate() {
		return registrationDate;
	}
	public void setRegistrationDate(Date registrationDate) {
		this.registrationDate = registrationDate;
	}
	public String getContacts() {
		return contacts;
	}
	public void setContacts(String contacts) {
		this.contacts = contacts;
	}
	public String getPhoneNumber() {
		return phoneNumber;
	}
	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}
	public String getSystemNumber() {
		return systemNumber;
	}
	public void setSystemNumber(String systemNumber) {
		this.systemNumber = systemNumber;
	}
	public String getPlateType() {
		return plateType;
	}
	public void setPlateType(String plateType) {
		this.plateType = plateType;
	}
	public String getVehicleState() {
		return vehicleState;
	}
	public void setVehicleState(String vehicleState) {
		this.vehicleState = vehicleState;
	}
	public String getCompetentAuthority() {
		return competentAuthority;
	}
	public void setCompetentAuthority(String competentAuthority) {
		this.competentAuthority = competentAuthority;
	}
	public int getState() {
		return state;
	}
	public void setState(int state) {
		this.state = state;
	}
	public double getLatitude() {
		return latitude;
	}
	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}
	public double getLongitude() {
		return longitude;
	}
	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}
	public String getWarnFlag() {
		return warnFlag;
	}
	public void setWarnFlag(String warnFlag) {
		this.warnFlag = warnFlag;
	}
	public Date getReportTime() {
		return reportTime;
	}
	public void setReportTime(Date reportTime) {
		this.reportTime = reportTime;
	}
	public String getWarningType() {
		return warningType;
	}
	public void setWarningType(String warningType) {
		this.warningType = warningType;
	}
	public String getVehicleFrameNumber() {
		return vehicleFrameNumber;
	}
	public void setVehicleFrameNumber(String vehicleFrameNumber) {
		this.vehicleFrameNumber = vehicleFrameNumber;
	}
	public int getVehicleOnlineState() {
		return vehicleOnlineState;
	}
	public void setVehicleOnlineState(int vehicleOnlineState) {
		this.vehicleOnlineState = vehicleOnlineState;
	}
	public double getSpeed() {
		return speed;
	}
	public void setSpeed(double speed) {
		this.speed = speed;
	}
	public Date getWarningEndTime() {
		return warningEndTime;
	}
	public void setWarningEndTime(Date warningEndTime) {
		this.warningEndTime = warningEndTime;
	}
	@Override
	public String toString() {
		return "VehicleInfoView [id=" + id + ", plateNumber=" + plateNumber + ", applyCompany=" + applyCompany
				+ ", ascriptionCompany=" + ascriptionCompany + ", vehicleType=" + vehicleType + ", authorizedLoad="
				+ authorizedLoad + ", registrationDate=" + registrationDate + ", contacts=" + contacts
				+ ", phoneNumber=" + phoneNumber + ", systemNumber=" + systemNumber + ", plateType=" + plateType
				+ ", vehicleState=" + vehicleState + ", vehicleOnlineState=" + vehicleOnlineState
				+ ", competentAuthority=" + competentAuthority + ", state=" + state + ", latitude=" + latitude
				+ ", longitude=" + longitude + ", warnFlag=" + warnFlag + ", reportTime=" + reportTime
				+ ", warningType=" + warningType + ", vehicleFrameNumber=" + vehicleFrameNumber + ", speed=" + speed
				+ "]";
	}
	public String getPlatePictureUrl() {
		return platePictureUrl;
	}
	public void setPlatePictureUrl(String platePictureUrl) {
		this.platePictureUrl = platePictureUrl;
	}
	public String getMotTestState() {
		return motTestState;
	}
	public void setMotTestState(String motTestState) {
		this.motTestState = motTestState;
	}
	public int getAccidentTotal() {
		return accidentTotal;
	}
	public void setAccidentTotal(int accidentTotal) {
		this.accidentTotal = accidentTotal;
	}
	public int getIllegalTotal() {
		return illegalTotal;
	}
	public void setIllegalTotal(int illegalTotal) {
		this.illegalTotal = illegalTotal;
	}
	public String getIntoCityCard() {
		return intoCityCard;
	}
	public void setIntoCityCard(String intoCityCard) {
		this.intoCityCard = intoCityCard;
	}
	public String getTransportCard() {
		return transportCard;
	}
	public void setTransportCard(String transportCard) {
		this.transportCard = transportCard;
	}
	public String getGpsState() {
		return gpsState;
	}
	public void setGpsState(String gpsState) {
		this.gpsState = gpsState;
	}
	public String getVehicleDept() {
		return vehicleDept;
	}
	public void setVehicleDept(String vehicleDept) {
		this.vehicleDept = vehicleDept;
	}
	
	
}
