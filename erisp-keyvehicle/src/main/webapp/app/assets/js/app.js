'use strict';
angular.module("pams", [
	'ngAnimate',
	'ngCookies',
	'ngStorage',
	'ngSanitize',
	'ngTouch',
	'ui.router',
	'ui.bootstrap',
	'oc.lazyLoad',
	'cfp.loadingBar',
	'ncy-angular-breadcrumb',
//	'duScroll',
	'pascalprecht.translate',
]);

/**
 * 运行模式。false-产品，true-调试
 * 由于正式环境与开发环境可能存在差异很多差异（如：ArcGis服务地址），根据判断不同的模式，可以选择不同运行模式
 * @type {boolean}
 */
var DEVELOP_MODE = true;

var refreshMap = 30000;//2秒刷新一次

/**
 * dataIp:数据服务接口地址。
 * 格式ip:port
 * @type {string}
 */
var dataIp = '';

/**
 * ArcGis服务地址。
 * 服务全路径
 * @type {string}
 */
var BASE_SERVER = '';

if (DEVELOP_MODE){
	// 开发模式初始化
	/*BASE_SERVER = 'http://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer';*/
	BASE_SERVER ='http://127.0.0.1:6080/arcgis/rest/services//myMap/baseMap001/MapServer';
	dataIp="127.0.0.1:8080";
	/*dataIp = "127.0.0.1:80";*/
//    dataIp = "localhost:8080";
//     dataIp = "192.168.199.219:8080";//数据接口ip--sunting
//     dataIp = "192.168.199.226:8080";//数据接口ip--sunting
     /*dataIp = "192.168.199.220:8888"*/;//数据接口ip--sunting
     // dataIp = "192.168.199.226:8080";//数据接口ip--sunting
} else {
	// 产品模式初始化
    BASE_SERVER = 'http://20.0.56.14:8399/arcgis/rest/services/201406chengdu/cd_base_0716/MapServer';
    dataIp = '20.2.13.35:8888';
}

var imageSize = 28;//图标大小

var ringRoad;
if (DEVELOP_MODE){
    //开发环境环路坐标点
    ringRoad = {
        'ringRoad1' : [
            [104.05178500607657,30.635640243181662],[104.05178500607657,30.635640243181662],[104.04251529172112,30.639775804552034],[104.04062701657463,30.641252747908187],[104.03856708005121,30.643911189116935],[104.03839541867423,30.65277213203991],[104.03805209592032,30.66281355231728],[104.03805209592032,30.676840260236684],[104.04268695309807,30.68555055888707],[104.04594851926016,30.68599343443828],[104.04955340817618,30.686583932013203],[104.05727817013907,30.687912538352162],[104.06689120724843,30.687617294079114],[104.07289935544178,30.686879179446347],[104.08251239255114,30.683483779455006],[104.09384204343003,30.677873726576024],[104.09590197995347,30.67551150155169],[104.1001935143773,30.664585459370134],[104.1001935143773,30.662370570477655],[104.09864856198472,30.65971263679933],[104.09418536618394,30.65232910417913],[104.0892071862523,30.644501943906572],[104.08800555661364,30.642877359551978],[104.07358600094959,30.635640243181662],[104.05178500607657,30.635640243181662]
        ],
        'ringRoad2' : [
            [104.02054263547112,30.644945007630675],[104.02054263547112,30.644649632040146],[104.0184826989477,30.670639229986783],[104.0188260217016,30.673592151180294],[104.0198559899633,30.67654498210863],[104.02191592648674,30.67920245276323],[104.02843905881095,30.684812428454094],[104.03702212765859,30.691603015581602],[104.0380520959203,30.69278393849777],[104.04011203244374,30.694555295782457],[104.042858614475,30.696326620558725],[104.04766513302968,30.69721227075583],[104.08165408566636,30.69662183819414],[104.10019351437725,30.68894588619747],[104.10637332394757,30.677726089204587],[104.10877658322491,30.670048634916714],[104.11289645627177,30.662075248123163],[104.11255313351786,30.65351050729641],[104.10740329220928,30.645831128989258],[104.10431338742414,30.641105054587424],[104.10019351437725,30.63431091805203],[104.09470035031477,30.623971099145272],[104.08234073117417,30.62308477754781],[104.07513095334214,30.62278933521175],[104.06414462521714,30.622198447834304],[104.05315829709218,30.622198447834304],[104.04423190549062,30.626630015240174],[104.03599215939688,30.631652212998258],[104.0311856408422,30.636083347499248],[104.02569247677971,30.64140044100344],[104.02054263547112,30.644945007630675]
        ],
        'ringRoad3' : [
            [104.00672389462643,30.705994528591596],[104.01771022275143,30.708946368526078],[104.02800990536859,30.714259452783313],[104.03624965146234,30.72016253646122],[104.04242946103264,30.725475002791846],[104.0458626885717,30.72960671865683],[104.0513558526342,30.729016484376316],[104.06577540829824,30.727836004972062],[104.07950831845446,30.724294480016557],[104.08431483700916,30.723704213207746],[104.09118129208726,30.721343109832393],[104.10491420224349,30.721343109832393],[104.11178065732162,30.721343109832393],[104.12276698544659,30.71898194863481],[104.12826014950909,30.71780134635349],[104.13375331357157,30.714849777412088],[104.13855983212628,30.71366912454115],[104.14542628720439,30.711307775439206],[104.15091945126686,30.709536725674017],[104.15641261532936,30.705994528591596],[104.1584725518528,30.698909744249324],[104.15915919736061,30.6859196219875],[104.16121913388405,30.67588060302002],[104.16121913388405,30.669384211147403],[104.15984584286842,30.66052479095633],[104.1584725518528,30.65461805960725],[104.1529793877903,30.64162198022347],[104.14817286923562,30.62921500252104],[104.14267970517314,30.623897239322154],[104.13718654111065,30.613851778339658],[104.13581325009503,30.609715109096637],[104.12620021298565,30.60262326500978],[104.10834742978255,30.597304041201383],[104.0808816094701,30.599077148253713],[104.06783534482167,30.599077148253713],[104.04929591611076,30.599077148253713],[104.03556300595453,30.6043962747113],[104.02045680478267,30.610897032626244],[104.00672389462643,30.62094280018073],[103.99779750302488,30.630987525319647],[103.98887111142334,30.643985033662986],[103.98200465634523,30.652845969819342],[104.00809718564206,30.707765643391127],[104.00672389462643,30.705994528591596]
        ],
        'ringRoad4' : [
            [103.96209193661863,30.77696123248954],[103.97582484677487,30.780500821066703],[103.98475123837642,30.782270566513592],[103.99779750302484,30.782270566513592],[104.00603724911858,30.783450378721277],[104.02800990536853,30.782270566513592],[104.03762294247791,30.78286047442649],[104.06028224423568,30.78757960747443],[104.0726418633763,30.78698972850752],[104.1021676202122,30.788169482822937],[104.10903407529031,30.788759354552955],[104.1619057793918,30.763981626854196],[104.19211818173552,30.737426981630797],[104.19898463681363,30.725622567122276],[104.20447780087613,30.681343139835434],[104.20379115536832,30.66953186126879],[104.20722438290738,30.66067245461529],[104.20447780087613,30.642360440625378],[104.20379115536832,30.614590450680375],[104.19967128232145,30.608680914175384],[104.18662501767301,30.600406957248243],[104.17975856259491,30.595678664565337],[104.1728921075168,30.583856923440262],[104.1673989434543,30.579718973413083],[104.1557259698215,30.57617201854281],[104.14611293271214,30.572033740551717],[104.13443995907934,30.572033740551717],[104.12414027646217,30.56966893099122],[104.11040736630594,30.56966893099122],[104.09186793759501,30.57144254356688],[104.08362819150129,30.570260138786587],[104.07126857236068,30.567895285984743],[104.05684901669663,30.567304063775918],[104.0259499688451,30.57617201854281],[104.0129037041967,30.583265798534995],[104.00741054013419,30.586812493899643],[103.98818446591548,30.58799469685139],[103.98269130185298,30.589176885384358],[103.96689845517331,30.60099797760904],[103.94767238095459,30.61045381299307],[103.94767238095459,30.61754508369036],[103.94286586239991,30.625226707515033],[103.93943263486085,30.647086453681464],[103.9311928887671,30.68665774395614],[103.92981959775149,30.714997358004684],[103.93325282529054,30.740377859333496],[103.93805934384523,30.75100027068139],[103.95453883603271,30.773421513675125],[103.96346522763426,30.777551172963555],[103.96209193661863,30.77696123248954]
        ],
        'tianfuguangchang' : [
            [104.06323569016229,30.665106816043146],[104.06321423249017,30.66508835894504],[104.06334297852288,30.665014530517393],[104.0634717245556,30.664719216242716],[104.06366484360467,30.664350072130237],[104.06392233567011,30.663999383917236],[104.06428711609614,30.663519492721324],[104.0646733541943,30.66305805663174],[104.06495230393186,30.662670448613763],[104.06503813462034,30.66248587282071],[104.06503813462034,30.662356669555795],[104.06505959229246,30.661064627406404],[104.06505959229246,30.660677011393286],[104.06514542298093,30.659606444804893],[104.06514542298093,30.659163448265176],[104.06495230393186,30.658905032679357],[104.06508104996458,30.658738908009354],[104.06473772721067,30.658757366320117],[104.0645660658337,30.6586835330559],[104.06372921662103,30.658701991377246],[104.06362192826043,30.658572783053813],[104.0632571478344,30.658572783053813],[104.06310694412956,30.658701991377246],[104.06181948380238,30.6586835330559],[104.06169073776967,30.658665074731026],[104.06166928009755,30.65971719362258],[104.06160490708119,30.65997560703697],[104.06164782242543,30.660344767859026],[104.06162636475331,30.66091696434662],[104.06160490708119,30.662079804835077],[104.06160490708119,30.662412042404767],[104.06169073776967,30.662596618338835],[104.06181948380238,30.662873481578966],[104.0622700949169,30.663519492721324],[104.0627207060314,30.664165499545188],[104.06323569016229,30.665106816043146]
        ],
        'renmingzhengfu' : [
            [104.07382505135321,30.652352120884387],[104.07350318627145,30.652425958984587],[104.07331006722238,30.652462878013534],[104.07317059235362,30.652527486280277],[104.0729989309767,30.65248133752273],[104.0724517603377,30.65248133752273],[104.07212989525594,30.652518256530524],[104.07138960556789,30.65272131082145],[104.0700377722245,30.653431997481125],[104.07030599312596,30.65387502028785],[104.07103555397795,30.654696453036628],[104.07126085953519,30.655056404513637],[104.0723444719771,30.65439187766307],[104.07277362541946,30.655102552041967],[104.07292382912428,30.655277912448714],[104.07470481591001,30.65528714193499],[104.07576697067984,30.654788748414912],[104.07384650902533,30.652352120884387],[104.07382505135321,30.652352120884387],[104.07382505135321,30.652352120884387]
        ]
    }
} else {
    //生产环境环路坐标点
    ringRoad = {
        'ringRoad1' : [
            [104.07625667079989,30.63358977595813],[104.07625667079989,30.63358977595813],[104.0663381292611,30.63338895084345],[104.05441512419413,30.63318907844265],[104.05201091586436,30.634391182607537],[104.04589950903028,30.63719608845278],[104.04399594022561,30.638198320216865],[104.04329447558584,30.639200546171722],[104.04179160720126,30.640602522737403],[104.04129096767616,30.640903289861707],[104.04119103147576,30.642005457826194],[104.04089026725607,30.65212482738428],[104.04048956683597,30.663846051718078],[104.04038962773096,30.66595044563742],[104.04058950303637,30.667152549802303],[104.04048956683597,30.66825471776679],[104.04038962773096,30.669857522351762],[104.04028873881668,30.67296319532131],[104.04048956683597,30.674967651587945],[104.044597468665,30.68188046216682],[104.04549880861019,30.682982628679],[104.04670090987045,30.683383329099086],[104.05952525488261,30.686188237848945],[104.07375157355585,30.685887474355407],[104.08336935377957,30.682381100239617],[104.08888018779277,30.67987600444788],[104.09449095800636,30.677271922265006],[104.09509153373186,30.677271922265006],[104.09549223124733,30.67677033147833],[104.09549223124733,30.67646956725864],[104.0976965671763,30.67436612460087],[104.10260587275012,30.662043371827693],[104.10280669786479,30.66134190718791],[104.10250593074049,30.659839038803337],[104.10100307106975,30.657433880664303],[104.09248650028742,30.643508323306154],[104.09028311707232,30.640502586537003],[104.08928089111747,30.639701185696825],[104.07625667079989,30.63358977595813]
        ],
        'ringRoad2' : [
            [104.04434666673627,30.69400191564684],[104.04750326632913,30.69475429964839],[104.05186052939758,30.69490420612745],[104.05727142721038,30.69475429964839],[104.06598739113197,30.69505411260651],[104.08056396576815,30.69475429964839],[104.08357065234656,30.69490420612745],[104.08552372160832,30.694453059797915],[104.10055143821712,30.686639386356937],[104.10250592783586,30.686188240027402],[104.10370803780998,30.684534992437598],[104.10866778493631,30.67566769296613],[104.11527934622471,30.659136624354285],[104.11527934622471,30.658235760766032],[104.11512945063796,30.651021711062835],[104.11302505671862,30.647114160896166],[104.0999503919439,30.626074491487522],[104.09619417514867,30.6214159820332],[104.09529188248959,30.620515118444945],[104.09393986821487,30.620063976472334],[104.07635660700028,30.61976273008647],[104.07079580488688,30.61976273008647],[104.06703958809164,30.61976273008647],[104.06463538557111,30.61976273008647],[104.06027668471797,30.619612825785875],[104.05787248219744,30.619612825785875],[104.05667037222332,30.619612825785875],[104.04629973599803,30.624422668611615],[104.0375837633626,30.628929844694518],[104.0227059510544,30.64395899473105],[104.02165374973782,30.64561224667778],[104.02165374973782,30.648617504185374],[104.02105269910768,30.673864536718806],[104.02165374973782,30.674916733678476],[104.03848605602168,30.689193499713457],[104.04464791312213,30.694153249018256],[104.04434666673627,30.69400191564684]
        ],
        'ringRoad3' : [
            [104.09749907365558,30.593462555867184],[104.09749907365558,30.59371239636818],[104.08873314744303,30.59546605796763],[104.08071674273347,30.596969879066083],[104.07821354510795,30.596969879066083],[104.06794379779694,30.596969879066083],[104.05040954906405,30.596969879066083],[104.04389934723764,30.598221477878844],[104.03888820294028,30.600474820480286],[104.03463134371532,30.602980399890505],[104.02761669731751,30.6069874040914],[104.0218560169941,30.609492983501617],[104.01759915776912,30.613250147201515],[104.01233817297077,30.618009069213176],[104.00682972219458,30.62126417012638],[104.00257048844645,30.624521652824285],[103.99906315798601,30.627526913236497],[103.99680980812303,30.6310318546507],[103.99405439547335,30.636043006209593],[103.9895453139627,30.642053519772474],[103.98629021304948,30.646310378997444],[103.98353480039981,30.649817702196344],[103.98303511213628,30.654576624208005],[103.98478639195103,30.661339055581653],[103.98779403414794,30.670856899604974],[103.99155119784784,30.67711963545355],[103.99430423597435,30.681376494678517],[103.99856346972248,30.68788907828963],[104.00006729082093,30.690394650438307],[104.00282032894745,30.69790898873041],[104.00507606059513,30.700162338593394],[104.00757925095911,30.702415688456376],[104.00933291255856,30.702917754873837],[104.01484374511945,30.70517110473682],[104.01885075658188,30.706674922204506],[104.0216061764931,30.708176361518262],[104.02761669731751,30.710931777798706],[104.03262784161487,30.714941171045836],[104.03513102471731,30.716944676777053],[104.04439902823964,30.724459015069158],[104.0456506270524,30.725460766119383],[104.0484060469636,30.726462520800375],[104.05066177134975,30.726962207248522],[104.05842595377362,30.726210296699296],[104.07395431862136,30.724708859200923],[104.0764598835085,30.723956948651697],[104.08096896501917,30.72270534983894],[104.08547566474513,30.721201532371253],[104.09123634506855,30.72019977769026],[104.1040116572667,30.719949937189263],[104.10601517389023,30.719700093057497],[104.10851835699266,30.719198026640036],[104.12880802563677,30.716192766227827],[104.13106138276129,30.7154408556786],[104.13356694764843,30.714439104628376],[104.13532060924788,30.71318750581562],[104.13957745394977,30.710931777798706],[104.14909529797309,30.709180494353184],[104.1521005583853,30.708678427935723],[104.15635979939496,30.70642507807274],[104.16011697761794,30.702667910742072],[104.1613685764307,30.69991249446163],[104.1618706392174,30.69615532713096],[104.16412398181883,30.665346067044087],[104.16337206400807,30.66284286941857],[104.1613685764307,30.656330285807456],[104.15385421998475,30.636043006209593],[104.14909529797309,30.627274690950802],[104.14734163637364,30.624019590037594],[104.14633989258496,30.621014329625385],[104.14609003756088,30.617507006426482],[104.13732411134832,30.604983901990952],[104.13532060924788,30.602980399890505],[104.12029193992521,30.595715898468626],[104.11853827832576,30.595715898468626],[104.11628492120124,30.595715898468626],[104.11327727900432,30.595216217466635],[104.09749907365558,30.593462555867184]
        ],
        'ringRoad4' : [
            [104.0506665639653,30.784066909572985],[104.05918028241524,30.785570730671438],[104.06369173118752,30.785570730671438],[104.06920257100995,30.785071042407907],[104.07571277283637,30.785071042407907],[104.08172329366078,30.785071042407907],[104.0917455822555,30.785570730671438],[104.10075898170743,30.786574856244822],[104.1052704304797,30.786574856244822],[104.10927746372675,30.786070411673432],[104.11679179112656,30.78306753304592],[104.12330199295297,30.78056434268194],[104.13031663935076,30.777556700485032],[104.14384148757499,30.77104649865862],[104.15986956247087,30.764031844999277],[104.16237749461963,30.762528023900824],[104.16688420886868,30.75952514527331],[104.17039153206758,30.757017198601474],[104.19944474513954,30.729967480368426],[104.20144826176306,30.725960476167532],[104.20245238733645,30.717946453242664],[104.20345174934043,30.708428609219343],[104.20545526596396,30.69740694409757],[104.20645939153733,30.6893929211727],[104.20645939153733,30.683882081350273],[104.20645939153733,30.675868058425408],[104.20695907253933,30.671856290655114],[104.20846290816087,30.660839389102737],[104.20846290816087,30.653325047179862],[104.20745875354133,30.64631040078206],[104.20645939153733,30.63980018443257],[104.20645939153733,30.63078203593432],[104.20695907253933,30.621264191911],[104.20695907253933,30.615253671086577],[104.20645939153733,30.611746347887678],[104.20495558496196,30.608239024688775],[104.19593742194064,30.602728184866347],[104.1904265821182,30.599725306238838],[104.18491574229578,30.595213857466554],[104.1804090570929,30.589203336642132],[104.176402052892,30.58269313481572],[104.1728947296931,30.577681975995286],[104.16438101124316,30.5731752907924],[104.15135584402094,30.57016764859549],[104.14233768099961,30.569667967593496],[104.12931251377739,30.56766445096997],[104.12129847632944,30.56716000639858],[104.11178063230612,30.56716000639858],[104.10676950253185,30.56716000639858],[104.0992551460859,30.568164131971965],[104.09424877988101,30.568164131971965],[104.0837268102843,30.565660934346446],[104.07671689840974,30.564656808773062],[104.06869812643856,30.56415712777107],[104.05617740378773,30.565156489775056],[104.04064903893999,30.57016764859549],[104.02912767829313,30.5731752907924],[104.02311242294547,30.575678488417917],[104.02010954431796,30.57818165699728],[104.01560283006893,30.58118929919419],[104.01159106229863,30.583192815817714],[104.00758405809773,30.58519633244124],[103.9995700206498,30.58519633244124],[103.99255537425199,30.58519633244124],[103.98654485342757,30.586195694445223],[103.9785308305027,30.5912068242195],[103.97202062867629,30.595713538468544],[103.96049926802944,30.600724668242822],[103.95248049605826,30.605231382491865],[103.94847347733429,30.609742831264153],[103.94597027970876,30.61876099428548],[103.94496615413538,30.625770877113886],[103.94296265203493,30.631781412461382],[103.94095913541142,30.63829637785719],[103.93895563331097,30.657831746905827],[103.93745181221251,30.662338446631793],[103.93344480801161,30.67436423732695],[103.93244543148455,30.68338240034828],[103.9314412913881,30.693399925373594],[103.933949252583,30.707924150124874],[103.934448933585,30.71543849204775],[103.93494862911007,30.727464297265985],[103.9379562567839,30.741988522017266],[103.94045945440942,30.747499347316616],[103.94296265203493,30.752010810611978],[103.94947761743074,30.760524521800377],[103.95699194483055,30.767539175459717],[103.96550566328048,30.775053510121054],[103.97301999068027,30.779060521583485],[103.98203815370161,30.78056434268194],[103.9960626974509,30.781563711947466],[104.01109138129664,30.781563711947466],[104.02211303189533,30.78005989811055],[104.0361375901677,30.781563711947466],[104.05116624496729,30.784571354144375],[104.0506665639653,30.784066909572985]
        ],
        'tianfuguangchang' : [
            [104.06559388656914,30.662917270262625],[104.06559388656914,30.662893475652566],[104.06585562727979,30.662917270262625],[104.06585562727979,30.662655529551983],[104.06637910870107,30.661632361319476],[104.06714053622293,30.66058539847691],[104.06735468771346,30.660252273936095],[104.06754504459393,30.65989535478522],[104.0676164284241,30.65863424045213],[104.0677354014744,30.658277321301256],[104.06759263381404,30.65806316981073],[104.06764022303416,30.6568258500877],[104.0679019637448,30.656564109377058],[104.06797334757497,30.656302368666416],[104.06747366076375,30.65627857405636],[104.06635531409101,30.6562547794463],[104.0661887518206,30.656016833345717],[104.06564147578926,30.6559692441256],[104.0656176811792,30.656183395616125],[104.0654511189088,30.6562547794463],[104.0644755398964,30.656183395616125],[104.06399964769524,30.65623098483624],[104.06411862074553,30.65668308242735],[104.06409482613547,30.657468304559273],[104.06407103152541,30.657967991370498],[104.0640234423053,30.65851526740184],[104.06404723691535,30.65865803506219],[104.06409482613547,30.659014954213063],[104.06411862074553,30.659419462584054],[104.06411862074553,30.659966738615395],[104.06435656684611,30.660395041596445],[104.06537973507862,30.66187030742006],[104.06559388656914,30.662346199621225],[104.06559388656914,30.662917270262625]
        ],
        'renmingzhengfu' : [
            [104.07330809915005,30.655024598106283],[104.07330809915005,30.655024598106283],[104.07799563733154,30.65269272632057],[104.07840014570253,30.65281169937086],[104.07868568102323,30.652597547880336],[104.07892362712381,30.65228821794958],[104.07878085946346,30.65200268262888],[104.07825737804218,30.651907504188646],[104.07563997093577,30.648433491120133],[104.07566376554582,30.648100366579317],[104.07521166795472,30.64819554501955],[104.07478336497367,30.6483383126799],[104.07290359077906,30.648956972541416],[104.07268943928854,30.649242507862116],[104.07045274594306,30.65088433595614],[104.07016721062236,30.650979514396372],[104.07028618367265,30.65131263893719],[104.0727132338986,30.654548705905117],[104.07276082311871,30.654834241225817],[104.07302256382935,30.655191160376692],[104.07330809915005,30.655024598106283]
        ]
    };
}

