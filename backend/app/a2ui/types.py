from typing import Any, Literal
from pydantic import BaseModel


class A2UIComponent(BaseModel):
    id: str
    type: str
    props: dict[str, Any] = {}
    children: list[str] = []  # child component IDs (adjacency list)


class CreateSurface(BaseModel):
    type: Literal["createSurface"] = "createSurface"
    surface: dict[str, Any]


class UpdateComponents(BaseModel):
    type: Literal["updateComponents"] = "updateComponents"
    components: list[A2UIComponent]


class UpdateDataModel(BaseModel):
    type: Literal["updateDataModel"] = "updateDataModel"
    path: str   # JSON Pointer (RFC 6901), e.g. "/order/items/0/count"
    value: Any


class DeleteSurface(BaseModel):
    type: Literal["deleteSurface"] = "deleteSurface"
    surface_id: str


A2UIMessage = CreateSurface | UpdateComponents | UpdateDataModel | DeleteSurface
