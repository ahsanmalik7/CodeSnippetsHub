const ActionMenu = (props: ActionMenuProps) => {
  const { nodeId,editMode, toggleEdit } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className='action-menu'>
      <ul>
        <li>
          
            <CheckSquare role='button' onClick={toggleEdit} />
          
        </li>
      </ul>
    </div>
  );
};

const IconMenu = (props:any) => {
  const {toggleIconButton} = props
  return (
    <div className='icon-menu-wrapper'>
      <ul>
        <li>
          <Edit role='button' onClick={toggleIconButton}/>
        </li>
      </ul>
    </div>
  );
};

interface RectangleProps {
  id?: string;
  height: number;
  width: number;
  data: any;
  
}

const Rectangle = forwardRef<HTMLDivElement, RectangleProps>((props, ref) => {
  
  const { id, height, width, data } = props;
  const nodes = useNodes();
  const { setNodes } = useReactFlow();
  const [showActionMenu, setActionMenu] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [incidenticon, setIncidentIcon] = useState({});

  const [selectedIcon, setSelectedIcon] = useState<IconDefinition | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showIconMenu, setIconMenu] = useState<boolean>(false);
  const [labelValue, setLabelValue] = useState(data?.label || '');
  const [isShowModal, setShowModal] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const toggle = () => setTooltip(!tooltip);
  const userInformation = sessionStorage.getItem('userInfo');
  const is_parent_user = sessionStorage.getItem('isParent') === 'false' ? false : true;
  const url = window.location.href.split('/');
  const incident_id = url[url.length - 1];
  let userEmail = '';
  if (is_parent_user) {
    userEmail = userInformation !== null ? JSON.parse(userInformation).email : '';
  } else {
    userEmail = userInformation !== null ? JSON.parse(userInformation).parent_email : '';
  }
  const closeDrawer = () => {
    setShowModal(false);
  };
  const [nodeType, setNodeType] = useState<{ Icon: string; color: string,uploaded: boolean } | null>(null);
  const {IncidentNodeColors }: IncidentContextInterface = useContext(IncidentContext);
  // console.log(IncidentNodeColors);
  const parsedNodeColors = JSON.parse(IncidentNodeColors);
  // console.log("node_id",id)
  // console.log("IncidentNodeColorsRecatangele",parsedNodeColors);
  useEffect(() => {
    const fetchNodeType = async () => {
      const nodeColor = getNodeTypeColor(data?.type,parsedNodeColors,id);
      console.log(nodeColor);
      setSelectedColor(nodeColor.color);
      if (data?.isManual === 'true') {
        const newNodeType: { Icon: string; color: string; uploaded: boolean } = {
          Icon: nodeColor['icon'], 
          // Icon: nodeColor['icon'],
          color: nodeColor['color'],
          // uploaded: iconUploaded  // Provide a default value if iconUploaded is undefined
          uploaded: nodeColor['uploaded'],  
        };
        setNodeType(newNodeType);
      }
      else{
      
      const newNodeType: { Icon: string; color: string; uploaded: boolean } = {
        Icon: nodeColor['icon'],  
        // Icon: data?.iconPath || '',  
        // Icon: nodeColor['icon']||'',  
        color: nodeColor['color'],
        // uploaded: JSON.parse(data?.iconUploaded) || false 
        uploaded: nodeColor['uploaded'], 
      };
      setNodeType(newNodeType);
      }
      

    };

    fetchNodeType(); // Fetch the nodeType when the component mounts
  }, [data?.type,id]);

  
  useEffect(() => {
    const nds: Node[] = nodes.map((node: Node) => {
      if (node.id === id) {
        node.data = {
          ...data,
          label: labelValue,
        };
      }
      return node;
    });
    setNodes(nds);
  }, [labelValue]);
  // const toggleActionMenu = () => !editMode && setActionMenu((prevState) => !prevState);
  // const toggleIconMenu = () => setIconMenu((prevState) => !prevState);
let imgsrc=''

 if(nodeType?.uploaded === true){
  const base64Data = (nodeType?.Icon as any)['$binary']['base64'];
  const dataUrl = `data:image/x-icon;base64,${base64Data}`;
  imgsrc=dataUrl
  // console.log("imgSrc:", imgsrc)
 }


 useEffect(() => {
  const pathname = window.location.pathname.split('/');
  const incid = pathname[pathname.length - 1];
  const type=data?.type
  setIncidentIcon({id,type,incid});
}, []);

const handleEditLabelClick = () => {
  setEditMode((prevState) => !prevState);
  console.log("Edit Mode", editMode)
  if (editMode===false){
    setActionMenu(true);
  }else{
    setActionMenu(false)
  }
  
};
const handleColorChangeComplete = async (color:Color ) => {
  // console.log("Selected color:", color.toHexString(),id,incident_id,userEmail,data?.type);
  // console.log(IncidentNodeColors)
  const colorhex=color.toHexString();
  setSelectedColor(colorhex);
  const payload = {
    id: id,
    // node_type: data?.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : null,
    node_type: data?.type,
    node_id: id,
    incident_id:incident_id,
    color_path: colorhex,
    user_email: userEmail,
    default: false
  };
  try {
    console.log(JSON.stringify(payload));
  
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/colors/update_node_color_incident`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  
    if (response.status === 201) {
      closeDrawer();
      toast.success("Node color has been updated successfully")
      setSearchQuery('');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error("Error updating default color")
  }

};
const items: MenuProps['items'] = [
  {
    key: '1',
    label: (
      // <a target="_blank" rel="noopener noreferrer" onClick={() => handleEditLabelClick()} >
        <a target="_blank" rel="noopener noreferrer" >
        Edit Label
      </a>
    ),
  },
  {
    key: '2',
    label: (
      <a target="_blank" rel="noopener noreferrer" onClick={() => setShowModal(true)} >
      
        Change Node Icon
      </a>
    ),
  },
  {
    key: '3',
    label: (
      // <a target="_blank" rel="noopener noreferrer" >
      //   Change Color
      
      // </a>
        <ColorPicker placement='topLeft' onChangeComplete={(color) => handleColorChangeComplete(color)}>
        Change Node Color
      </ColorPicker>
    ),
  },
];


// console.log(incidentid);
  return (
    <Dropdown menu={{ items }} trigger={['contextMenu']}>
    <div
    ref={ref}
      className='flow-rectangle'
      onDoubleClick={() => handleEditLabelClick()}
      style={{
        minWidth: width,
        minHeight: height,
        backgroundColor: selectedColor || 'transparent',
      }}
    >
      <CommonDrawer
        closeDrawer={closeDrawer}
        showDrawer={isShowModal}
        setSearchQuery={setSearchQuery}
        setSelectedIcon={setSelectedIcon}
        setSelectedImage={setSelectedImage}
        searchQuery={searchQuery}
        isCanvas={true}
        selectedNode={incidenticon}
      />
      <EditableInput
        editable={editMode}
        value={labelValue}
       
        onChange={(e: ChangeEvent<HTMLInputElement>) => setLabelValue(e.target.value)}
      />
      <div className='icon-box-wrapper'>
        {nodeType && (
          <div className='icon-box'>
            <div className='icon' style={{ backgroundColor: selectedColor || 'transparent' }} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setShowModal(true)}
            >
              <div >
                {showIconMenu && (
                  <IconMenu toggleIconButton={() => setShowModal((prevState) => !prevState)}/>
                )}
                {selectedIcon || selectedImage ? (
                   <div className= 'node-icon-box'>
                   {selectedIcon ? (
                     <FontAwesomeIcon  icon={selectedIcon.iconName} />
                   ) : selectedImage ? (
                     <img  src={selectedImage} alt="Selected" style={{ width: '21px', height: '21px' }} />
                   ) : null}
                 </div>
                  ):

                  (<div>
                  {nodeType.uploaded ? (
        <img src={imgsrc} alt="Icon" style={{ width: '21px', height: '21px' }} />
      ) : (
        <FontAwesomeIcon icon={nodeType.Icon as IconProp} />
      )}
                  </div>
               ) }
              </div>
            </div>
            <p>{data.iconLabel}</p>
          </div>
        )}
        {data?.userExecuted && (
          <div className='icon-box user'>
            <div className='icon' style={{ backgroundColor: selectedColor || 'transparent' }}>
              <User size={ICON_SIZE} />
            </div>
            <p>User</p>
          </div>
        )}
      </div>
      {data?.count && data.count >= 2 &&(
     <div className="count-icon">
         
        <span className="count-label">{data.count - 1}</span>
      
      </div>
      )}


      {showActionMenu && (
        <ActionMenu nodeId={id} editMode={editMode} toggleEdit={() => handleEditLabelClick()} />
      )}
    </div>
    </Dropdown>
  );
});

export default Rectangle;
