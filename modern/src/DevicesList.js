import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { devicesActions } from './store';
import EditCollectionView from './EditCollectionView';
import { useEffectAsync } from './reactHelper';
import WifiIcon from '@material-ui/icons/Wifi';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import SpeedIcon from '@material-ui/icons/Speed';
import HeightIcon from '@material-ui/icons/Height';
import LocalGasStationIcon from '@material-ui/icons/LocalGasStation';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import SearchBar from "material-ui-search-bar";
import { useState,useEffect } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReplayPathMap from './map/ReplayPathMap';
import PauseIcon from '@material-ui/icons/Pause';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import ReportFilter from './reports/ReportFilter';
import moment from 'moment';
import SwapCallsOutlinedIcon from '@material-ui/icons/SwapCallsOutlined';
import { formatHours } from './common/formatter';
import { formatSpeed } from './common/formatter';
import VpnKeyIcon from '@material-ui/icons/VpnKey';


const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '100%',
    overflow: 'auto',
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
    
  },
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
  absolute: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(3),
  },
}));

const DeviceView = ({ deviceId,updateTimestamp, onMenuClick }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const items = useSelector(state => Object.values(state.devices.items));
  const device = useSelector(state => state.devices.items);
  const position = useSelector(state => Object.values(state.positions.items));


 

const [laoding,setloading]=useState(false)
  
 var mm={}
  const drivors = async (id) => {
    
    let i=0;
    let urllist=[]
    //for(i;i< items.length;i++){
        const response = await fetch('/api/drivers?deviceId='+id)
        const json = await response.json()
        if(json!=[]){
          json.forEach(i=>{
            if(i!=undefined && i.name.substring(0,2)=="S*")
            { mm={...mm,[id]:i.name.substring(2)} }
          })   
        }
     return mm;
   } 
 
 
  

  function findspeed(item){
    var text="0"
    position.forEach(i=>{if(i.deviceId==item.id){text=formatSpeed(i.speed,'kmh')}})
    return text
  }

  function findDistance(item){
    var text="0"
    position.forEach(i=>{if(i.deviceId==item.id){text=i.attributes.totalDistance}})
    return text
  }
  //popover section
   
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  //end of popever section
  
  //ignit function
  const colorignit=(item)=>{
    var stat=""
    position.forEach(i=>{if(i.deviceId==item.id){stat=i.attributes.gpsStatus}})
    var col="";var title="Gps Deconnecté"
    if(stat=="1"){col="green";title="Gps Connecté"}
    //else if(i.status=="unknown"){col= "#FF7600"}
    return [col,title]
  }

  const [rows, setRows] = useState([]);
  const [constantItems,setconst] =useState([])

  const findstateMotor=(item)=>{
    var ignit=false
    var motion=false
    var text=""
    var colo="#808080"
    position.forEach(i=>{if(i.deviceId==item.id){ignit=i.attributes.ignition;motion=i.attributes.motion}})
    if(ignit & motion){text="voiture démarrée en mouvement";colo="#50CB93"}
    else if(ignit & !motion){text="voiture démarrée et pas en mouvement";colo="#FFD523"}
    else if(!ignit){text="voiture n'est pas démarrée"}
    return [text,colo]
  }

  const findfuel=(item)=>{
    var fuel=""
    position.forEach(i=>{if(i.deviceId==item.id){fuel=i.attributes.io84/10}})
    return fuel

  }

  
  const [xx,setxx]=useState({})
  useEffectAsync(async () => {
    var x={}
    const response = await fetch('/api/devices');
    if (response.ok) {
      const ro=await response.json()
      dispatch(devicesActions.refresh(ro));
      setRows(ro)
      setconst(ro)
    for(var i=0;i<ro.length;i++){  
    x= await drivors(ro[i].id)
      }
      setloading(true)
      setxx(x)
    }
  }, [updateTimestamp]);

    

  
  //Search filter
  
  const [searched, setSearched] = useState("");

  const requestSearch = (searchedVal) => {
   
    const filteredRows = constantItems.filter((row) => {
      return row.name.toLowerCase().includes(searchedVal.toLowerCase());
    });
  setRows(filteredRows);
};

const cancelSearch = () => {
  setSearched("");
  requestSearch(searched);
};

  //end of search filter

  //last replay
  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const handleSubmit = async (deviceId, from, to, _, headers) => {
    //const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch('/api/positions?deviceId='+deviceId+'&from='+from+'&to='+to, { Accept: 'application/json' });
    if (response.ok) {
      setIndex(0);
      setPositions(await response.json());  
    }
  };

  const showtraj=(item)=>{
    return(
          <div style={{display:"none"}} >
            <ReportFilter handleSubmit={handleSubmit(item.id,moment().startOf('day').toISOString(),moment().endOf('day').toISOString())} showOnly />
            </div>
    )
  }

  //end of last replay 

  //get adress
  const [adress,setadress]=useState("")
  const [loadgeocode,setloadgeocode]=useState(false)
  const geocode=async(item)=>{
    setloadgeocode(true)
    var lat=""
    var lon=""
    
    position.forEach(i=>{if(i.deviceId==item.id){lat=i.latitude.toString();lon=i.longitude.toString()}})
    const r =await fetch("https://api.openrouteservice.org/geocode/reverse?api_key=5b3ce3597851110001cf624803d896806f2544b6a95312df342a12d7&point.lon="+lon+"&point.lat="+lat)
    if(r.ok){
      const response=await r.json();
      setadress(response.features[0].properties.label)
    } 
    else{
      setadress("Donnée indisponible")
    }
    setloadgeocode(false)
}

  //end of adress
  
  //Function stops
  const [stop,setstop]=useState("")
  const [loadstop,setloadstop]=useState(false)
  const showStop=async(id)=>{
    setloadstop(true)
    var stops=""
    const now =new Date().toISOString()
    const debut=new Date('2021-07-28 00:00').toISOString()
    var myHeaders=new Headers()
    myHeaders.append("Content-Type", "application/json")
    const r = await fetch('api/reports/stops?deviceId='+id+'&from='+debut+'&to='+now,{method:"GET",headers: {'Accept': 'application/json','Content-Type': 'application/json' }})
    if(r.ok){
            const res=await r.json()
            res.forEach(i=>stops=(i.duration)) 
    }
    setstop(formatHours(stops))
    setloadstop(false) 
    //return stops
  }

  return (
    <div style={{maxHeight:'100%'}}>
  <SearchBar
    value={searched}
    onChange={(searchVal) => requestSearch(searchVal)}
    onCancelSearch={() => cancelSearch()}
  />

    {laoding ?( 
        
    <List className={classes.list} >
      {rows.map((item, index, list) => (
        
        <Fragment key={item.id}>
          
         {xx[item.id] != undefined &&
          <>
           
           <Tooltip title={colorignit(item)[1]} arrow>
            <IconButton style={{marginLeft:-5, width:"20px",height:"20px"}}>
            <FiberManualRecordIcon
            style={{fill: `${colorignit(item)[0]}`, width:"20px",height:"20px"}}/>
            </IconButton>
            </Tooltip>

          
          
          <ListItem button key={item.id} onClick={() => dispatch(devicesActions.select(item))}>
            
            <ListItemAvatar>
            <Tooltip onClose={()=>setadress("")}  title={<>
               {loadgeocode?(
               <CircularProgress style={{color:"#FFFF"}} size="25px"/> 
               ):(adress?adress:"clicker pour afficher l'adresse")}</>
              } arrow>
              <Avatar  onClick={()=> geocode(item)} color="primary">
                <img className={classes.icon} src={`images/icon/${item.category || 'default'}.svg`} alt="" />
              </Avatar>
              </Tooltip>
            </ListItemAvatar>
            
            <div>
            <ListItem  style={{marginBottom:"20px"}}>
            <ListItemText   
            primary={<Typography variant="subtitle2" style={{ marginTop:'-15px' ,color: '#000000' }}>{item.name.toUpperCase()}</Typography> }
            
            ></ListItemText>
            
            
            </ListItem >
            <TextField
            
            style={{marginTop:"-20px", }}
            id="outlined-size-normal"
            value={xx[item.id] || ''}
            variant="outlined"
            size="small"
            label="№ sequentiel"
        />
             <Tooltip title={findstateMotor(item)[0]} arrow>
            <IconButton style={{marginLeft:-5, width:"20px",height:"20px"}}>
            <VpnKeyIcon
            style={{fill: `${findstateMotor(item)[1]}`, width:"20px",height:"20px"}}/>
            </IconButton>
            </Tooltip>
            
            <Tooltip title={"Vitesse: " +findspeed(item)} arrow>
            <IconButton  style={{marginLeft:17, width:"20px",height:"20px"}}>
            <SpeedIcon color="primary" style={{width:"20px",height:"20px"}} />
            </IconButton>
            </Tooltip>
            <Tooltip title={"Distance:"+(findDistance(item)/1000).toString().split(".")[0]+" Km" } arrow>
            <IconButton  style={{marginLeft:12, width:"20px",height:"20px"}}>
             <HeightIcon color="primary" style={{width:"20px",height:"20px"}} />
             </IconButton>
             </Tooltip>
             <Tooltip title={"Carburant: "+findfuel(item) } arrow>
             <IconButton  style={{marginLeft:15, width:"20px",height:"20px"}}>
            <LocalGasStationIcon color="primary" style={{width:"20px",height:"20px"}}  /> 
            </IconButton>
            </Tooltip>
            <Tooltip  title={"afficher dernier trajet"} arrow>
            <IconButton  style={{marginLeft:18, width:"20px",height:"20px"}} onClick={()=>showtraj(item)} >
            <SwapCallsOutlinedIcon color="primary" style={{width:"20px",height:"20px"}} /> 
            </IconButton>
            </Tooltip>
            <Tooltip onOpen={()=>showStop(item.id)} title={
            <>{loadstop?(<CircularProgress style={{color:"#FFFF"}} size="25px" />):(stop!=""? "Dernier Stop enregistré : "+stop :"Donnée indisponible" )} </>
            }
            onClose={()=>setstop("None")}
            arrow>
            <span>
              <Button  style={{ width:"20px",height:"20px",pointerEvents: "none" }}  startIcon={<PauseIcon />}  >
              
              </Button>
              </span>
              </Tooltip>
            <ReplayPathMap positions={positions} />
            
             
            {/* <Tooltip title={"Ajouter Facture"} arrow>
            <IconButton  style={{marginLeft:18, width:"20px",height:"20px"}} onClick={()=>history.push('/cout/'+item.id)} >
            <AttachMoneyIcon color="primary" style={{width:"20px",height:"20px"}} /> 
            </IconButton>
            </Tooltip> */}
            </div>
            
            <ListItemSecondaryAction>
              <IconButton style={{marginRight:"-10px"}} onClick={(event) => onMenuClick(event.currentTarget, item.id)}>
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
           
          </ListItem>
           
          
          {index < list.length - 1 ? <Divider /> : null}
          </>
      }
        </Fragment>
    
      
      ))}
    </List>
   
    
    ):(< CircularProgress style={{marginTop:"50px",marginLeft:"18vh"}} />)
  }
    
    </div>
  );
}

const DevicesList = () => {
  return (
    <EditCollectionView content={DeviceView} editPath="/device" endpoint="devices" />
  );
}

export default DevicesList;
