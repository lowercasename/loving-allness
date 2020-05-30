import React from "react"
import { DragDropContext as DragDropContext_, Droppable as Droppable_, Draggable as Draggable_ } from "react-beautiful-dnd"


// Maps

const draggableMap = {}
const droppableMap = {}


// Draggable

export class Draggable extends React.Component {
  componentDidMount() {
    draggableMap[this.props.draggableId] = this
  }

  componentWillUnmount() {
    delete draggableMap[this.props.draggableId]
  }

  callHandler = (handler, result) => {
    this.props[handler] && this.props[handler](result)
  }

  getPayload = () => this.props.payload

  render() {
    return <Draggable_ {...this.props} />
  }
}


// Droppable

export class Droppable extends React.Component {
  componentDidMount() {
    droppableMap[this.props.droppableId] = this
  }

  componentWillUnmount() {
    delete droppableMap[this.props.droppableId]
  }

  callHandler = (handler, result) => {
    this.props[handler] && this.props[handler](result)
  }

  getPayload = () => this.props.payload

  render() {
    return <Droppable_ {...this.props} />
  }
}


// DragDropContext

export class DragDropContext extends React.Component {
  callHandler = (droppableId, handler, result) => {
    droppableMap[droppableId] && droppableMap[droppableId].callHandler(handler, result)
  }

  callHandlerOnDraggable = (draggableId, handler, result) => {
    draggableMap[draggableId] && draggableMap[draggableId].callHandler(handler, result)
  }

  getPayload = (droppableId) => {
    return droppableMap[droppableId] && droppableMap[droppableId].getPayload()
  }

  getDraggablePayload = (draggableId) => {
    return draggableMap[draggableId] && draggableMap[draggableId].getPayload()
  }

  handleEvent = handler => result => {
    let { source, destination, draggableId } = result

    if (source) { source.payload = this.getPayload(source.droppableId) }
    if (destination) { destination.payload = this.getPayload(destination.droppableId) }

    result.payload = this.getDraggablePayload(draggableId)

    // console.log(handler, result)

    this.callHandlerOnDraggable(draggableId, handler, result)

    if (destination) {
      this.callHandler(destination.droppableId, handler, result)
    }

    if (!destination || destination.droppableId !== source.droppableId) {
      this.callHandler(source.droppableId, handler, result)
    }

    this.props[handler] && this.props[handler](result)
  }

  render() {
    let newProps = {
      ...this.props,
      onBeforeDragStart: this.handleEvent('onBeforeDragStart'),
      onDragStart: this.handleEvent('onDragStart'),
      onDragUpdate: this.handleEvent('onDragUpdate'),
      onDragEnd: this.handleEvent('onDragEnd')
    }
    return <DragDropContext_ {...newProps} />
  }
}