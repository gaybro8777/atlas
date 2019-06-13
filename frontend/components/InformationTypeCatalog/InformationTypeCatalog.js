import React, { Component } from 'react';
import styles from './InformationTypeCatalog.css';
import { Button,
         ButtonToolbar,
         ButtonGroup,
         ToggleButtonGroup,
         ToggleButton,
         DropdownButton,
         Dropdown,
         Modal } from 'react-bootstrap';
import Select from 'react-select';
import Tooltip from '@material-ui/core/Tooltip';
import Description from "@material-ui/icons/Description";
import Delete from "@material-ui/icons/Delete";
import Add from "@material-ui/icons/Add";
import Remove from "@material-ui/icons/Remove";
import NoteAdd from "@material-ui/icons/NoteAdd";
import Check from "@material-ui/icons/Check";
import Clear from "@material-ui/icons/Clear";
import Popup from "reactjs-popup";
import BootstrapTable  from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';

type Props = {
    information_types: object
}

var searchOptions = []
var catalogHeight;

const headerStyle =
        {
        height: 'calc(var(--vh, 1vh) * 5)',
        backgroundColor: 'darkgrey',
        fontWeight: 'bolder',
        whiteSpace: 'nowrap',
        headerAlign: 'center',
        border: 'outset',
        borderColor: 'darkgrey',
        borderRadius: '8px'
        }

export default class InformationTypeCatalog extends Component<Props> {
  props: Props;

  constructor(props){
    super(props);

    this.state = {
        selectedOption: null,
        triad_rating: {
            'confidentiality': null,
            'integrity': null,
            'availability': null
        },
        information_types: []
    }

    this.onChange = this.onChange.bind(this);
    this.startEditor = this.startEditor.bind(this);
    this.addNewInformationType = this.addNewInformationType.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.cancelChanges = this.cancelChanges.bind(this);
  }

  componentWillReceiveProps(newProps){
     if(newProps.information_types != this.props.information_types){
         this.setState(state => {

          let info_types = newProps.information_types.map((entry) => {

            entry.isEditing = false;
            return(entry);
          });

          return {
                information_types: info_types
            }
         });
     }

  }

  componentDidMount(){
    const {
        getInformationCategories,
        getInformationTypes,
    } = this.props;

    getInformationCategories();
    getInformationTypes();

  }

  componentDidUpdate(){
    this.setSearchOptions();
  }

  buttonSearch(triad_key, value){

        return(
          <ToggleButtonGroup
                type="radio"
                name={triad_key}
                value={value}
                onChange={(e) => {
                    this.handleSearch(
                        {"label": this.buttonSearch(triad_key, e),
                        "group": "triad_rating",
                        "name": triad_key,
                        "value": e
                        }
                        )
                    }}
                >
                {triad_key}:
                <ToggleButton className={styles.ciaButton} value={triad_key + '-high'}>High</ToggleButton>
                <ToggleButton className={styles.ciaButton} value={triad_key + '-medium'}>Medium</ToggleButton>
                <ToggleButton className={styles.ciaButton} value={triad_key + '-low'}>Low</ToggleButton>
            </ToggleButtonGroup>
            );

  }

  setSearchOptions(){

      let informationTypeNames = this.props.information_types.map((entry) => {
        return({"value": entry.name,  "label": entry.name, "group": "name"});
      });

      let informationCategoryOptions = this.props.information_categories.map((entry) => {
        return({"id": entry.id, "value": entry.name,  "label": entry.name, "group": "information_categories"});
      });


      let CIAOptions = [
      {
      "label": this.buttonSearch("confidentiality", null),
      "group": "triad_rating",
      "name": "confidentiality",
      "value": this.state.triad_rating["confidentiality"]
      },
      {
      "label": this.buttonSearch("integrity", null),
      "group": "triad_rating",
      "name": "integrity",
      "value": this.state.triad_rating["integrity"]
      },
      {
      "label": this.buttonSearch("availability", null),
      "group": "triad_rating",
      "name": "availability",
      "value": this.state.triad_rating["availability"]
      }
      ]

      searchOptions = [
        {
        "label": "CIA Rating",
        "options": CIAOptions
        },
        {
        "label": "Information Categories",
        "options": informationCategoryOptions
        },
        {
        "label": "Information Types",
        "options": informationTypeNames
        }
    ]

  }

  addNewInformationType(){

    let newInfoType = {
        'id': '',
        'name': '',
        'triad_rating': {
            'confidentiality': 'medium',
            'integrity': 'medium',
            'availability': 'medium'
        },
        'security_reasoning': '',
        'information_categories': [],
        'isEditing': true
    }

    this.setState(state => {
        return {
            information_types: [...state.information_types, newInfoType]
        }
    }, () => {

        let catalogElement = document.getElementById("informationTypesCatalog");
        catalogElement.scrollTop = catalogElement.scrollHeight;

    });
  }

  deleteInformationType(information_type){

    let deleteConfirm = confirm("Are You Sure You Want to Delete This Information Type?");
    if(deleteConfirm){

        this.props.deleteInformationType(information_type);
        this.props.getInformationTypes();
    }
  }

  cancelChanges(information_type){

      if(information_type.id === ""){
        this.props.deleteInformationType(information_type);
      }
      this.props.getInformationTypes();
  }

  saveChanges(information_type){

    if(information_type.name !== ''){
        if(information_type.id === ''){
            this.props.createInformationType(information_type);
        } else {
            this.props.updateInformationType(information_type);
        }

        this.stopEditor(information_type);
        this.props.getInformationTypes();

    } else {
        alert("Information Type must Have a Name to be Saved !!!");
    }
  }

  onChange(label, value, information_type){

    this.setState(state => {

        let entry = state.information_types.find(x => x.id === information_type.id)
        entry[label] = value
        return {
            entry
            }
    });
  }

  startEditor(information_type){

    this.setState(state => {

        let entry = state.information_types.find(x => x.id === information_type.id);
        entry.isEditing = true;

        return {
            entry
        }
    });
  }

  stopEditor(information_type){

    this.setState(state => {

        let entry = state.information_types.find(x => x.id === information_type.id);
        entry.isEditing = false;

        return {
            entry
        }
    });
  }

  handleSearch(option, action){

    const {
      getInformationTypes
    } = this.props;

    if(option.group === "triad_rating"){

        this.setState(state => {

             let selectedOption = state.selectedOption;
             let entryIndex = state.selectedOption.findIndex(x => x.name === option.name);
             selectedOption[entryIndex].label = option.label;
             selectedOption[entryIndex].value = option.value;

             return {
                selectedOption,
                triad_rating: {...state.triad_rating, [option.name]: option.value}
                }
        }, () => getInformationTypes(this.state.selectedOption));

    } else {

        this.setState(state => {
            return {
                selectedOption: option
                }
            }, () => getInformationTypes(this.state.selectedOption));
    }
  }

  getRowStyle(row, rowIdx){

    return {
         backgroundColor: rowIdx % 2 === 0 ? 'black': '#303030',
         height: 'calc(var(--vh, 1vh) * 5)'
              }
    }

  render(){

    const {
        information_categories
    } = this.props;

    const {
        information_types
    } = this.state;

    let informationTypesViewer = information_types.map((information_type) => {

        let tableData = [information_type];

        let information_type_categories = information_type.information_categories.map((entry_id) => {

                let entry = information_categories.find(entry => entry.id === entry_id);
                if(entry !== undefined){
                    if(information_type.isEditing){

                         return(
                         <Button
                            key={entry.id}
                            className={styles.informationCategoryTagEdit}
                            variant="primary"
                            value={entry.name}
                            active
                            >
                            <div className={styles.removeButtonContainer}>
                                {entry.name}
                                <Tooltip title="Remove Information Category">
                                    <Remove
                                        className={styles.removeButton}
                                        style={{"color": "snow", "height": "30px", "width": "30px"}}
                                        onClick={(e) => {
                                                    let new_categories = information_type.information_categories.filter(x => x !== entry_id);
                                                    this.onChange("information_categories",
                                                                        new_categories,
                                                                        information_type)}}
                                    />
                                </Tooltip>
                            </div>
                         </Button>)

                    } else {


                        return(
                         <Button
                            key={entry.id}
                            className={styles.informationCategoryTag}
                            variant="primary"
                            value={entry.name}
                            onClick={(e) => {}}
                            active
                            >
                            {entry.name}
                         </Button>)
                    }
                }
        });

        let cleanView = (
            <div key={information_type.id} className={styles.informationTypeView}>
                <div className={styles.optionsBar}>
                    <h3>{information_type.name}</h3>
                    <Tooltip title="Edit">
                        <Description
                            className={styles.editButton}
                            style={{'color': '#F06449', 'height': '50px', 'width': '40px'}}
                            onClick={() => { this.startEditor(information_type)}}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Delete
                            className={styles.deleteButton}
                            style={{'color': '#F06449', 'height': '50px', 'width': '40px'}}
                            onClick={() => {this.deleteInformationType(information_type)} }
                        />
                    </Tooltip>
                </div>
                <div className={styles.informationTypeInfo}>
                    <div className={styles.mainInfo}>
                         <p>{information_type.security_reasoning}</p>
                         <BootstrapTable
                            classes={styles.ciaTable}
                            data={tableData}
                            columns={[
                                {dataField: "id", text: "ID", hidden: true},
                                {dataField: "triad_rating.confidentiality", text: 'Confidentiality', editable: false, headerStyle: headerStyle},
                                {dataField: "triad_rating.integrity", text: 'Integrity', editable: false, headerStyle: headerStyle},
                                {dataField: "triad_rating.availability", text: 'Availability', editable: false, headerStyle: headerStyle}
                                ]}
                            cellEdit={ cellEditFactory({ mode:'dbclick' }) }
                            rowStyle={this.getRowStyle}
                            keyField="id">
                        </BootstrapTable>
                     </div>
                <ButtonToolbar className={styles.informationCategories}>
                        {information_type_categories}
                </ButtonToolbar>
                </div>
            </div>
        )

        let editView = (
            <div key={information_type.id} className={styles.informationTypeView}>
                <div className={styles.optionsBar}>
                    <input
                            label="name"
                            className={styles.nameInput}
                            type="text"
                            onChange={(e) => this.onChange("name", e.target.value, information_type)}
                            value={information_type.name}>
                        </input>
                    <Tooltip title="Save">
                        <Check
                            className={styles.saveButton}
                            style={{"color": "green", "height": "40px", "width": "50px"}}
                            onClick={() => this.saveChanges(information_type)}
                        />
                    </Tooltip>
                    <Tooltip title="Cancel">
                        <Clear
                            className={styles.clearButton}
                            style={{"color": "#F06449", "height": "40px", "width": "40px"}}
                            onClick={() => {
                                    this.cancelChanges(information_type);
                                    this.stopEditor(information_type);
                                    }
                            }
                    />
                </Tooltip>
                </div>
                <div className={styles.informationTypeInfo}>
                    <div className={styles.mainInfo}>
                          <textarea
                            label="security_reasoning"
                            className={styles.descriptionInput}
                            onChange={(e) => this.onChange("security_reasoning", e.target.value, information_type)}
                            value={information_type.security_reasoning}>
                          </textarea>
                          <BootstrapTable
                            keyField="id"
                            classes={styles.ciaTable}
                            data={tableData}
                            columns={[
                                {
                                dataField: "id",
                                text: "ID",
                                hidden: true
                                },
                                {
                                dataField: "triad_rating.confidentiality",
                                text: 'Confidentiality',
                                headerStyle: headerStyle,
                                editable: true,
                                editor: {
                                    type: Type.SELECT,
                                    options: [
                                    {
                                    value: "high",
                                    label: "high"
                                    },
                                    {
                                    value: "medium",
                                    label: "medium"
                                    },
                                    {
                                    value: "low",
                                    label: "low"
                                    }]}
                                },
                                {
                                dataField: "triad_rating.integrity",
                                text: 'Integrity',
                                headerStyle: headerStyle,
                                editable: true,
                                editor: {
                                    type: Type.SELECT,
                                    options: [
                                    {
                                    value: "high",
                                    label: "high"
                                    },
                                    {
                                    value: "medium",
                                    label: "medium"
                                    },
                                    {
                                    value: "low",
                                    label: "low"
                                    }]}
                                },
                                {
                                dataField: "triad_rating.availability",
                                text: 'Availability',
                                headerStyle: headerStyle,
                                editable: true,
                                editor: {
                                    type: Type.SELECT,
                                    options: [
                                    {
                                    value: "high",
                                    label: "high"
                                    },
                                    {
                                    value: "medium",
                                    label: "medium"
                                    },
                                    {
                                    value: "low",
                                    label: "low"
                                    }]}
                                }]
                                }
                            cellEdit={ cellEditFactory({ mode:'dbclick', blurToSave: true }) }
                            rowStyle={this.getRowStyle}
                            >
                        </BootstrapTable>
                     </div>
                <ButtonToolbar className={styles.informationCategories}>
                        {information_type_categories}
                        <Popup
                            className={styles.addModal}
                            trigger={<Tooltip title="Add Information Category"><Add className={styles.addButton} style={{"color": "green", "height": "35px", "width": "35px", "marginTop": "2px"}} /></Tooltip>}
                            modal
                        >
                        {close => {

                            let categoryOptions = searchOptions.filter(x => x.label === "Information Categories");
                            let selectedCategories = categoryOptions[0]['options'].filter(x => {
                                if(information_type.information_categories.includes(x.id)){
                                    return(x)
                                }
                            })


                            return (
                            <div className={styles.addSearchBar}>
                                <Select
                                    isMulti
                                    value={selectedCategories}
                                    options={categoryOptions}
                                    onChange={(e) =>
                                        {
                                            let info_categories = e.map(entry => entry.id);
                                            this.onChange("information_categories", info_categories, information_type);
                                            close();
                                        }
                                    }
                                    placeholder={"Add Item to Information Categories"}
                                />
                            </div>
                            )
                            }
                        }
                        </Popup>
                </ButtonToolbar>
                </div>
            </div>
        )

        return(information_type.isEditing ? editView : cleanView)
    });


    return (
        <div className={styles.componentBody}>
            <div className={styles.catalogContainer}>
                <Select
                    isMulti
                    className={styles.searchBar}
                    value={this.state.selectedOption}
                    options={searchOptions}
                    onChange={(value, action) => {
                        this.handleSearch(value, action)
                        }
                    }
                    placeholder="Search Information Types ..."
                />
                <Tooltip title="Add New Information Type">
                            <NoteAdd
                                className={styles.addButton}
                                style={{'color': 'snow', 'height': '50px', 'width': '40px'}}
                                onClick={() => this.addNewInformationType()}
                            />
                </Tooltip>
            </div>
            <div id="informationTypesCatalog" className={styles.informationTypesContainer}>
                {informationTypesViewer}
            </div>
        </div>
    )


  }
 }